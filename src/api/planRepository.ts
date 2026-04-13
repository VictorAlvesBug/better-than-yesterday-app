
import { getDateTime } from '@/src/utils/dateUtils';
import { generateId } from '@/src/utils/stringUtils';
import { CreatePlan, Plan, PlanEnriched, PlanParticipant, PlanParticipantStatus } from '@/types/plan.type';
import { User } from '@/types/user.type';
import { api } from '../utils/apiUtils';
import createHabitRepository from './habitRepository';
import createUserRepository from './userRepository';

export default function createPlanRepository() {
    const habitRepository = createHabitRepository();
    const userRepository = createUserRepository();

    const listPlanMembers = async (planId: Plan['id']) =>
        await api.list('planParticipants', { planId });

    const listUserPlans = async (userId: User['id']) =>
        await api.list('planParticipants', { userId });

    const withEnrichment = async (plans: Plan[]): Promise<PlanEnriched[]> => {
        const tasks = plans
            .map(async plan => {
                const habit = await habitRepository.getById(plan.habitId);
                const owner = await userRepository.getById(plan.ownerId);

                const planParticipants = await listPlanMembers(plan.id);

                if (!habit)
                    throw new Error("Habit not found...");

                if (!owner)
                    throw new Error("Owner not found...");

                return {
                    ...plan,
                    habitName: habit.name,
                    ownerName: owner.nickname,
                    memberCount: planParticipants.filter(pp => ['active', 'blocked'].includes(pp.status)).length
                } as PlanEnriched;
            });

        return (await Promise.all(tasks))
            .filter(planWithHabit => Boolean(planWithHabit)) as PlanEnriched[];
    }

    const listByPlanIds = async (planIds: string[]) => {
        const plansTasks = planIds
            .map(async planId => {
                return await api.get('plans', { id: planId });
            });

        const plans = (await Promise.all(plansTasks))
            .filter(plan => Boolean(plan)) as Plan[];

        return withEnrichment(plans);
    }

    const listAll = async () => {
        return await api.list('plans');
    };

    const getById = async (id: string) => {
        const plan = await api.get('plans', { id });

        if (!plan)
            throw new Error("Plan not found...");

        return withEnrichment([plan]).then(plans => plans[0]);
    };

    const listByUserId = async (userId: string) => {
        const planParticipants = await listUserPlans(userId);
        const planIds = planParticipants.map(pp => pp.planId);

        return listByPlanIds(planIds);
    };

    const save = async (createPlan: CreatePlan) => {
        const plan = { ...createPlan, id: generateId(), status: 'NotStarted', createdAt: getDateTime() } satisfies Plan;
        return await api.save('plans', plan);
    };

    const join = async (planId: string, userId: string) => {
        const payload: PlanParticipant = {
            id: generateId(),
            planId,
            userId,
            joinedAt: getDateTime(),
            status: 'active'
        };
        return await api.save('planParticipants', payload);
    };

    const leave = async (planId: string, userId: string) => {
        await api.delete('planParticipants', { planId, userId });
    };

    const listPublic = async () => {
        return withEnrichment(await api.list('plans', { type: 'public' }));
    };

    const joinedPlans = async (userId: string) => {
        const validStatuses: PlanParticipantStatus[] = ['active', 'blocked'];

        const planParticipants = await listUserPlans(userId);

        const joinedPlanIds = planParticipants
            .filter(pp => validStatuses.includes(pp.status))
            .map(pp => pp.planId);
        return listByPlanIds(joinedPlanIds);
    };


    return {
        listAll,
        getById,
        listByUserId,
        save,
        join,
        leave,
        listPublic,
        joinedPlans
    }
}