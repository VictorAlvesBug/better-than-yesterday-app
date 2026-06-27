
import { CreateHabit, HabitEnriched } from '@/types/habit.type';
import { mapHabitEnrichedFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createHabitRepository() {
    const oneWithEnrichment = async (habitId: string): Promise<HabitEnriched> => {
        const habit = await backendApi.getHabitById(habitId);
        return mapHabitEnrichedFromApi(habit);
    }

    const list = async (filter?: { name?: string }): Promise<HabitEnriched[]> => {
        console.log("HabitRepository.list - filter:", filter);
        const habits = await backendApi.listHabits(filter);
        return habits.map(mapHabitEnrichedFromApi);
    };

    const getById = async (id: string): Promise<HabitEnriched> => {
        console.log("HabitRepository.getById - id:", id);
        return oneWithEnrichment(id);
    };

    const create = async (createHabit: CreateHabit): Promise<HabitEnriched> => {
        console.log("HabitRepository.create - createHabit:", createHabit);
        const habitCreated = await backendApi.createHabit(createHabit);
        return mapHabitEnrichedFromApi(habitCreated);
    };

    return {
        list,
        getById,
        create
    }
}
