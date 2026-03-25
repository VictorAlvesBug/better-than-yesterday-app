
import { API_URL } from '@/src/utils/constants';
import { Plan, PlanParticipant, PlanWithHabit } from '@/types/plan.type';
import axios from 'axios';
import createHabitRepository from './habitRepository';

export default function createPlanRepository() {
    const habitRepository = createHabitRepository();

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
            console.log({ planParticipants });
            const plansTasks = planParticipants
                .map(async planParticipant => {
                    return (await axios.get<Plan>(`${API_URL}/plans/${planParticipant.planId}`)).data;
                });

            const plans = (await Promise.all(plansTasks))
                .filter(plan => Boolean(plan)) as Plan[];
            console.log({ plans });
            const planWithHabitTasks = plans
                .map(async plan => {
                    const habit = await habitRepository.getById(plan.habitId);

                    if (!habit)
                        throw new Error("Habit not found...");

                    return { ...plan, habitName: habit.name } as PlanWithHabit;
                });

            return (await Promise.all(planWithHabitTasks))
                .filter(planWithHabit => Boolean(planWithHabit)) as PlanWithHabit[];
        },
    }
}