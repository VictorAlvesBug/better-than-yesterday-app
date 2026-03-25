
import { API_URL } from '@/src/utils/constants';
import { Habit, SaveHabit } from '@/types/habit.type';
import axios from 'axios';

export default function createHabitRepository(){
    const listAll = async () => {
            return (await axios.get<Habit[]>(`${API_URL}/habits`)).data;
        };

        const getById = async (id: string) => {
            return (await axios.get<Habit | null>(`${API_URL}/habits/${id}`)).data;
        };

        const save = async (saveHabit: SaveHabit) => {
            const response = await axios.post(`${API_URL}/habits`, saveHabit);
            console.log(response.data);
            if (response.status !== 201)
                throw new Error(`HTTP: ${response.status} - ${response.data}`);

            return await getById('');
        };
    
    return {
        listAll: listAll,
        getById,
        save
    }
}