
import { CreateUser, User } from '@/types/user.type';
import { api } from '../utils/apiUtils';

export default function createUserRepository() {
    const list = async (filter?: Partial<User>): Promise<User[]> => {
        console.log("UserRepository.list - filter:", filter);
        return await api.list('users', filter);
    };

    const getById = async (id: string): Promise<User> => {
        console.log("UserRepository.getById - id:", id);
        const user = await api.get('users', { id });

        if (!user)
            throw new Error(`Usuário não encontrado para o id '${id}'`);

        return user;
    }

    const get = async (filter?: Partial<User>): Promise<User> => {
        console.log("UserRepository.get - filter:", filter);
        const user = await api.get('users', filter);

        if (!user)
            throw new Error(`Usuário não encontrado para o filtro ${JSON.stringify(filter)}`);

        return user;
    }

    const create = async (createUser: CreateUser): Promise<User> => {
        createUser.phoneNumber = createUser.phoneNumber.replace(/\D/g, '');
        console.log("UserRepository.create - createUser:", createUser);
        
        return await api.createWithBody('users', createUser);
    }

    return {
        list,
        getById,
        get,
        create,
    }
}