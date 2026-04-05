
import { API_URL } from '@/src/utils/constants';
import { getDateTime } from '@/src/utils/dateUtils';
import { generateId } from '@/src/utils/stringUtils';
import { CreatePlan, Plan, PlanParticipant, PlanParticipantStatus, PlanWithHabit } from '@/types/plan.type';
import axios from 'axios';
import createHabitRepository from './habitRepository';

export default function createPlanRepository() {
    const habitRepository = createHabitRepository();

    const withHabits = async (plans: Plan[]): Promise<PlanWithHabit[]> => {
        const tasks = plans
            .map(async plan => {
                const habit = await habitRepository.getById(plan.habitId);

                if (!habit)
                    throw new Error("Habit not found...");

                return { ...plan, habitName: habit.name } as PlanWithHabit;
            });

        return (await Promise.all(tasks))
            .filter(planWithHabit => Boolean(planWithHabit)) as PlanWithHabit[];
    }

    const listByPlanIds = async (planIds: string[]) => {
            const plansTasks = planIds
                .map(async planId => {
                    return (await axios.get<Plan>(`${API_URL}/plans/${planId}`)).data;
                });

            const plans = (await Promise.all(plansTasks))
                .filter(plan => Boolean(plan)) as Plan[];

            return withHabits(plans);
        }

    return {
        listAll: async () => {
            return (await axios.get<Plan[]>(`${API_URL}/plans`)).data;
        },
        getById: async (id: string) => {
            const plan = (await axios.get<Plan | null>(`${API_URL}/plans/${id}`)).data;

            if (!plan)
                throw new Error("Plan not found...");

            const habit = await habitRepository.getById(plan.habitId);

            if (!habit)
                throw new Error("Habit not found...");

            return { ...plan, habitName: habit.name } as PlanWithHabit;
        },
        listByUserId: async (userId: string) => {
            const planParticipants = (await axios.get<PlanParticipant[]>(`${API_URL}/planParticipants?userId=${userId}`)).data;
            console.log(planParticipants.map(p => ({ userId: p.userId, planId: p.planId })))
            const planIds = planParticipants.map(pp => pp.planId);

            return listByPlanIds(planIds);
        },
        save: async (createPlan: CreatePlan) => {
            const plan = { ...createPlan, id: generateId(), status: 'NotStarted', createdAt: getDateTime() }
            await axios.post<Plan>(`${API_URL}/plans`, plan);
            return plan;
        },
        join: async (planId: string, userId: string) => {
            const payload: PlanParticipant = {
                id: generateId(),
                planId,
                userId,
                joinedAt: getDateTime(),
                status: 'active'
            };
            const response = await axios.post<PlanParticipant>(`${API_URL}/planParticipants`, payload);
            return response.data;
        },
        abandon: async (planId: string, userId: string) => {
            const planParticipants = (await axios.get<PlanParticipant[]>(`${API_URL}/planParticipants?planId=${planId}&userId=${userId}`)).data;

            if(planParticipants.length === 0)
                throw new Error(`O usuário '${userId}' não está neste plano '${planId}'`);

            const first = planParticipants[0];
            await axios.delete(`${API_URL}/planParticipants/${first.id}`)
        },
        listPublic: async () => {
            const plans = (await axios.get<Plan[]>(`${API_URL}/plans?type=public`)).data;
            return withHabits(plans);
        },
        joinedPlans: async (userId: string) => {
            const response = await axios.get<PlanParticipant[]>(`${API_URL}/planParticipants?userId=${userId}`);
            const validStatuses: PlanParticipantStatus[] = ['active', 'blocked'];
            const joinedPlanIds = response.data
                .filter(pp => validStatuses.includes(pp.status))
                .map(pp => pp.planId);
            return listByPlanIds(joinedPlanIds);
        } 
    }
}