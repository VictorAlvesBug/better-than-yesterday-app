import { z } from "zod";
import { baseResourceSchema } from "./common.type";

export type AuthUser = {
    name: string | null;
    email: string;
    photo: string | null;
    id: string;
    familyName: string | null;
    givenName: string | null;
}

const userSchema = baseResourceSchema.extend({
    email: z.email({ error: "E-mail é obrigatório e deve ser válido" }),
    name: z.string().min(3, { error: "Nome é obrigatório" }),
    photo: z.string().min(3, { error: "Foto é obrigatória" }),
    nickname: z.string().min(3, { error: "Nickname é obrigatório" }),
    phoneNumber: z.string().min(8, { error: "Número de telefone é obrigatório" }),
    pixKey: z.string().min(3, { error: "Chave PIX é obrigatória" }),
});
export type User = z.infer<typeof userSchema>;

export const createUserSchema = userSchema.omit({ id: true, createdAt: true });
export type CreateUser = z.infer<typeof createUserSchema>;

//export type UpdateUser = Omit<User, 'email'>;