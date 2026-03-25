
import { API_URL } from '@/src/utils/constants';
import { User } from '@/types/user.type';
import axios from 'axios';

export default function createUserRepository(){
    return {
        listAll: async () => {
            return (await axios.get<User[]>(`${API_URL}/users`)).data;
        },
        getById: async (id: string) => {
            const response = await axios.get<User | null>(`${API_URL}/users/${id}`);
            
            if (response.status !== 200)
                throw new Error(`HTTP: ${response}`);

            return response.data;
        },
    }
}