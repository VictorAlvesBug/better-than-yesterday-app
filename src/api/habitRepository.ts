
import { CreateHabit, Habit, HabitEnriched } from '@/types/habit.type';
import { api } from '../utils/apiUtils';

export default function createHabitRepository() {
    //const planRepository = createPlanRepository();

    const oneWithEnrichment = async (habit: Habit): Promise<HabitEnriched> => {
        //const plans = await planRepository.list({ habitId: habit.id });
        return {
            ...habit,
            planCount: 0//plans.length
        } satisfies HabitEnriched;
    }

    const manyWithEnrichment = async (habits: Habit[]): Promise<HabitEnriched[]> => {
        const tasks = habits.map(async habit => oneWithEnrichment(habit));
        return Promise.all(tasks);
    }

    const list = async (filter?: Partial<Habit>): Promise<HabitEnriched[]> => {
        console.log("HabitRepository.list - filter:", filter);
        const habits = await api.list('habits', filter);
        return manyWithEnrichment(habits);
    };

    const getById = async (id: string): Promise<HabitEnriched> => {
        console.log("HabitRepository.getById - id:", id);
        const habit = await api.get('habits', { id });

        if (!habit) 
            throw new Error(`Hábito não encontrado para o id '${id}'`);

        return oneWithEnrichment(habit);
    };

    const create = async (createHabit: CreateHabit): Promise<HabitEnriched> => {
        console.log("HabitRepository.create - createHabit:", createHabit);
        const habitCreated = await api.createWithBody('habits', createHabit);
        return oneWithEnrichment(habitCreated);
    };

    return {
        list,
        getById,
        create
    }
}