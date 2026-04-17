
import { CreateUser, User } from '@/types/user.type';
import { api } from '../utils/apiUtils';
import { getDateTime } from '../utils/dateUtils';
import { generateId } from '../utils/stringUtils';

export default function createUserRepository() {
    const list = async (filter?: Partial<User>): Promise<User[]> => {
        return await api.list('users', filter);
    };

    const getById = async (id: string): Promise<User> => {
        const user = await api.get('users', { id });

        if (!user)
            throw new Error(`Usuário não encontrado para o id '${id}'`);

        return user;
    }

    const get = async (filter?: Partial<User>): Promise<User> => {
        const user = await api.get('users', filter);

        if (!user)
            throw new Error(`Usuário não encontrado para o filtro ${JSON.stringify(filter)}`);

        return user;
    }

    const create = async (createUser: CreateUser): Promise<User> => {
        const user = {
            ...createUser,
            id: generateId(),
            createdAt: getDateTime(),
        } satisfies User;
        
        return await api.create('users', user);
    }

    return {
        list,
        getById,
        get,
        create,
    }
}