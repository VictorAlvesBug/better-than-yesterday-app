import { BaseResource } from "./common.type";

export type AuthUser = {
    name: string | null;
    email: string;
    photo: string | null;
    id: string;
    familyName: string | null;
    givenName: string | null;
}

export type User = BaseResource & {
    email: string;
    name: string;
    photo: string;
    nickname: string;
    phoneNumber: string;
    pixKey: string;
}

export type CreateUser = Omit<User, 'id' | 'createdAt'>;

//export type UpdateUser = Omit<User, 'email'>;