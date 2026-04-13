
import { Habit } from '@/types/habit.type';
import { api } from '../utils/apiUtils';

export default function createHabitRepository() {
    const listAll = async () => await api.list('habits');

    const getById = async (id: string) => await api.get('habits', { id });

    const save = async (saveHabit: Habit) => await api.save('habits', saveHabit);

    return {
        listAll,
        getById,
        save
    }
}