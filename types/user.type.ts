export type AuthUser = {
    name: string | null;
    email: string;
    photo: string | null;
    id: string;
    familyName: string | null;
    givenName: string | null;
}

export type User = {
    id: string;
    email: string;
    name: string;
    photo: string;
    nickname: string;
    phoneNumber: string;
    pixKey: string;
}