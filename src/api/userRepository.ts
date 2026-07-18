
import { CreateUser, UpdateUser, User } from '@/types/user.type';
import { mapUserFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createUserRepository() {
    const list = async (filter?: Partial<User>): Promise<User[]> => {
        console.log("UserRepository.list - filter:", filter);
        const users = await backendApi.listUsers(filter?.email ? { email: filter.email } : undefined);
        return users.map(mapUserFromApi);
    };

    const getById = async (id: string): Promise<User> => {
        console.log("UserRepository.getById - id:", id);
        const user = mapUserFromApi(await backendApi.getUserById(id));
        return user;
    }

    const get = async (filter?: Partial<User>): Promise<User> => {
        console.log("UserRepository.get - filter:", filter);
        if (filter?.id)
            return getById(filter.id);

        const users = await list(filter);

        if (users.length === 0)
            throw new Error(`Usuário não encontrado para o filtro ${JSON.stringify(filter)}`);

        return users[0];
    }

    const create = async (createUser: CreateUser): Promise<User> => {
        createUser.phoneNumber = createUser.phoneNumber.replace(/\D/g, '');
        if (createUser.pixKeyType === 'PhoneNumber' || createUser.pixKeyType === 'TaxIdentification') {
            createUser.pixKey = createUser.pixKey.replace(/\D/g, '');
        }
        console.log("UserRepository.create - createUser:", createUser);

        return mapUserFromApi(await backendApi.registerUser(createUser));
    }

    const update = async (updateUser: UpdateUser & { name?: string; email?: string }): Promise<User> => {
        const phoneNumber = updateUser.phoneNumber.replace(/\D/g, '');
        let pixKey = updateUser.pixKey;
        if (updateUser.pixKeyType === 'PhoneNumber' || updateUser.pixKeyType === 'TaxIdentification') {
            pixKey = pixKey.replace(/\D/g, '');
        }

        console.log("UserRepository.update - updateUser:", updateUser);

        return mapUserFromApi(await backendApi.updateUser({
            userId: updateUser.id,
            name: updateUser.name,
            email: updateUser.email,
            photoUrl: updateUser.photoUrl,
            nickname: updateUser.nickname,
            phoneNumber,
            pixKey,
            pixKeyType: updateUser.pixKeyType,
        }));
    }

    return {
        list,
        getById,
        get,
        create,
        update,
    }
}
