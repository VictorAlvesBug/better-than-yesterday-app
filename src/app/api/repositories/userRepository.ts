
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
        getByEmail: async (email: string) => {
            const response = await axios.get<User[]>(`${API_URL}/users?email=${email}`);
            
            if (response.status !== 200)
                throw new Error(`HTTP: ${response}`);

            return response.data.length > 0 ? response.data[0] : null;
        },
        save: async (user: User) => {
            const response = await axios.post(`${API_URL}/users`, user);
            
            if (response.status !== 201)
                throw new Error(`HTTP: ${response}`);

            return JSON.stringify(response.data); // TODO: Ajustar
        }
    }
}