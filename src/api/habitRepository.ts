
import { CreateHabit, Habit, HabitEnriched } from '@/types/habit.type';
import { api } from '../utils/apiUtils';
import { getDateTime } from '../utils/dateUtils';
import { generateId } from '../utils/stringUtils';

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
        const habits = await api.list('habits', filter);
        return manyWithEnrichment(habits);
    };

    const getById = async (id: string): Promise<HabitEnriched> => {
        const habit = await api.get('habits', { id });

        if (!habit) 
            throw new Error(`Hábito não encontrado para o id '${id}'`);

        return oneWithEnrichment(habit);
    };

    const create = async (createHabit: CreateHabit): Promise<HabitEnriched> => {
        const habit = {
            ...createHabit,
            id: generateId(),
            createdAt: getDateTime()
        } satisfies Habit;

        const habitCreated = await api.create('habits', habit);
        return oneWithEnrichment(habitCreated);
    };

    return {
        list,
        getById,
        create
    }
}