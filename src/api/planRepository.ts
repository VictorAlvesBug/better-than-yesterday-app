
import { getDate, getDateTime } from '@/src/utils/dateUtils';
import { generateId } from '@/src/utils/stringUtils';
import { CreateOrDeletePlanMember, CreatePlan, Plan, PlanEnriched, PlanMember, PlanMemberEnriched, PlanStatus } from '@/types/plan.type';
import { api } from '../utils/apiUtils';
import createHabitRepository from './habitRepository';
import createUserRepository from './userRepository';

export default function createPlanRepository() {
    const habitRepository = createHabitRepository();
    const userRepository = createUserRepository();

    const getPlanStatus = (plan: Plan): PlanStatus => {
        if (plan.isCancelled)
            return 'cancelled';

        const today = new Date();

        if (getDate(plan.endsAt) < today)
            return 'finished';

        if (getDate(plan.startsAt) > today)
            return 'not-started';

        return 'running';
    }

    const onePlanWithEnrichment = async (plan: Plan): Promise<PlanEnriched> => {
        const habit = await habitRepository.getById(plan.habitId);
        const owner = await userRepository.getById(plan.ownerId);

        const planMembers = await listPlanMembers({ planId: plan.id });

        if (!habit)
            throw new Error("Habit not found...");

        if (!owner)
            throw new Error("Owner not found...");

        return {
            ...plan,
            habitName: habit.name,
            ownerName: owner.nickname,
            memberCount: planMembers.filter(member => ['active', 'blocked'].includes(member.status)).length,
            status: getPlanStatus(plan)
        } satisfies PlanEnriched;
    }

    const manyPlansWithEnrichment = async (plans: Plan[]): Promise<PlanEnriched[]> => {
        const tasks = plans.map(async plan => onePlanWithEnrichment(plan));
        return Promise.all(tasks);
    }

    const onePlanMemberWithEnrichment = async (planMember: PlanMember): Promise<PlanMemberEnriched> => {
        const plan = await getById(planMember.planId);
        const user = await userRepository.getById(planMember.userId);

        return {
            ...planMember,
            user,
            plan
        } satisfies PlanMemberEnriched;
    }

    const manyPlanMembersWithEnrichment = async (planMembers: PlanMember[]): Promise<PlanMemberEnriched[]> => {
        const tasks = planMembers.map(async planMember => onePlanMemberWithEnrichment(planMember));
        return Promise.all(tasks);
    }

    const listByUserId = async (userId: string): Promise<PlanEnriched[]> => {
        const planMembers = await listPlanMembers({ userId, status: 'active' });
        const planIds = planMembers.map(planMember => planMember.planId);
        return listByPlanIds(planIds);
    }

    const list = async (filter?: Partial<Plan>): Promise<PlanEnriched[]> => {
        const plans = await api.list('plans', filter);
        return manyPlansWithEnrichment(plans);
    };

    const listByPlanIds = async (planIds: string[]): Promise<PlanEnriched[]> => {
        const tasks = planIds.map(async planId => {
            return await getById(planId);
        })
        return Promise.all(tasks);
    };

    const listPlanMembers = async (filter?: Partial<PlanMember>): Promise<PlanMember[]> => {
        return await api.list('planMembers', filter);
    };

    const getById = async (id: string): Promise<PlanEnriched> => {
        const plan = await api.get('plans', { id });

        if (!plan)
            throw new Error(`Plano não encontrado para o id '${id}'`);

        return onePlanWithEnrichment(plan);
    };

    const create = async (createPlan: CreatePlan): Promise<PlanEnriched> => {
        const plan = {
            ...createPlan,
            id: generateId(),
            createdAt: getDateTime()
        } satisfies Plan;

        const planCreated = await api.create('plans', plan);
        return onePlanWithEnrichment(planCreated);
    };

    const join = async (createPlanMember: CreateOrDeletePlanMember): Promise<PlanMemberEnriched> => {
        const payload: PlanMember = {
            ...createPlanMember,
            id: generateId(),
            joinedAt: getDateTime(),
            createdAt: getDateTime(),
            status: 'active',
        };
        const planMemberCreated = await api.create('planMembers', payload);
        return onePlanMemberWithEnrichment(planMemberCreated);
    };

    const leave = async (deletePlanMember: CreateOrDeletePlanMember): Promise<void> => {
        await api.delete('planMembers', { planId: deletePlanMember.planId, userId: deletePlanMember.userId });
    };

    return {
        list,
        listPlanMembers,
        listByUserId,
        getById,
        create,
        join,
        leave,
    }
}