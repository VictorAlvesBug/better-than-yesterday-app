
import { User } from '@/types/user.type';
import { api } from '../utils/apiUtils';

export default function createUserRepository() {
    const listAll = async () => await api.list('users');

    const getById = async (id: string) => await api.get('users', { id });

    const getByEmail = async (email: string) => await api.get('users', { email });

    const save = async (user: User) => await api.save('users', user);

    return {
        listAll,
        getById,
        getByEmail,
        save,
    }
}