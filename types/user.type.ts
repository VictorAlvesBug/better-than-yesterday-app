import { zodEnumWithValidation } from "@/src/utils/zodUtils";
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

export const pixKeyTypeSchema = zodEnumWithValidation(
  ['TaxIdentification', 'Email', 'PhoneNumber', 'EVP'] as const,
  "Tipo de Chave Pix"
);
export type PixKeyType = z.infer<typeof pixKeyTypeSchema>;

export const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  TaxIdentification: 'CPF/CNPJ',
  Email: 'E-mail',
  PhoneNumber: 'Telefone',
  EVP: 'Chave aleatória',
};

const brazilianPhoneRegex = /^\d{2}(9\d{4}|\d{4})\d{4}$/;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidPixKey(pixKey: string, pixKeyType: PixKeyType): boolean {
  const trimmed = pixKey.trim();
  if (!trimmed) return false;

  switch (pixKeyType) {
    case 'TaxIdentification': {
      const digits = onlyDigits(trimmed);
      return digits.length === 11 || digits.length === 14;
    }
    case 'Email':
      return z.email().safeParse(trimmed.toLowerCase()).success;
    case 'PhoneNumber':
      return brazilianPhoneRegex.test(onlyDigits(trimmed));
    case 'EVP':
      return z.uuid().safeParse(trimmed.toLowerCase()).success;
    default:
      return false;
  }
}

function refinePixKey(
  data: { pixKey: string; pixKeyType: PixKeyType },
  ctx: z.RefinementCtx,
) {
  if (!isValidPixKey(data.pixKey, data.pixKeyType)) {
    ctx.addIssue({
      code: 'custom',
      path: ['pixKey'],
      message: `Informe uma chave PIX válida para ${PIX_KEY_TYPE_LABELS[data.pixKeyType]}`,
    });
  }
}

const userFieldsSchema = baseResourceSchema.extend({
  email: z.email({ error: "E-mail é obrigatório e deve ser válido" }),
  name: z.string().min(3, { error: "Nome é obrigatório" }),
  photoUrl: z.string().min(3, { error: "Foto é obrigatória" }),
  nickname: z.string().min(3, { error: "Nickname é obrigatório" }),
  phoneNumber: z
    .string()
    .min(8, { error: "Número de telefone é obrigatório" })
    .refine((value) => brazilianPhoneRegex.test(onlyDigits(value)), {
      error: "Informe um número de telefone válido",
    }),
  pixKey: z.string().min(1, { error: "Chave PIX é obrigatória" }),
  pixKeyType: pixKeyTypeSchema,
});

export const userSchema = userFieldsSchema.superRefine(refinePixKey);
export type User = z.infer<typeof userFieldsSchema>;

const createUserFieldsSchema = userFieldsSchema.omit({ id: true, createdAt: true });
export const createUserSchema = createUserFieldsSchema.superRefine(refinePixKey);
export type CreateUser = z.infer<typeof createUserFieldsSchema>;

const updateUserFieldsSchema = z.object({
  id: z.guid({ error: "ID do usuário é obrigatório" }),
  nickname: z.string().min(3, { error: "Nickname é obrigatório" }),
  phoneNumber: z
    .string()
    .min(8, { error: "Número de telefone é obrigatório" })
    .refine((value) => brazilianPhoneRegex.test(onlyDigits(value)), {
      error: "Informe um número de telefone válido",
    }),
  photoUrl: z.string().min(3, { error: "Foto é obrigatória" }),
  pixKey: z.string().min(1, { error: "Chave PIX é obrigatória" }),
  pixKeyType: pixKeyTypeSchema,
});
export const updateUserSchema = updateUserFieldsSchema.superRefine(refinePixKey);
export type UpdateUser = z.infer<typeof updateUserFieldsSchema>;
