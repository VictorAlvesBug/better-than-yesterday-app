import { parseDateOnly, parseDateTime } from "@/src/utils/dateUtils";
import { formatMoneyCompact } from "@/src/utils/numberUtils";
import { formatEachAndJoin } from "@/src/utils/stringUtils";
import { zodEnumWithValidation } from "@/src/utils/zodUtils";
import { z } from "zod";
import { baseResourceSchema } from "./common.type";
import { User } from "./user.type";


const planTypeSchema = zodEnumWithValidation(['private', 'public'] as const, "Tipo do plano");
export type PlanType = z.infer<typeof planTypeSchema>;

const planStatusSchema = zodEnumWithValidation(['not-started', 'running', 'finished', 'cancelled'] as const, "Status do plano");
export type PlanStatus = z.infer<typeof planStatusSchema>;

const planMemberStatusSchema = zodEnumWithValidation(['active', 'blocked'] as const, "Status do membro do plano");
export type PlanMemberStatus = z.infer<typeof planMemberStatusSchema>;


export const penaltyValueOptions = [1, 5, 10, 20, 50, 100];
const penaltyValueSchema = z.union(
    penaltyValueOptions.map(option => z.literal(option)),
    {
        error: `Valor da multa deve ser ${formatEachAndJoin(penaltyValueOptions, formatMoneyCompact)}`
    }
);
export type PenaltyValue = z.infer<typeof penaltyValueSchema>;

export type PenaltyOption = {
    id: string;
    label: string;
}

export function parsePenaltyValue(strValue: string): PenaltyValue {
    const value = Number.parseInt(strValue);

    const penaltyValue = penaltyValueOptions.find(v => v === value)

    if (penaltyValue === undefined)
        throw new Error(`Não foi possível converter '${strValue}' para PenaltyValue. Valores permitidos [${penaltyValueOptions.join(',')}]`)

    return penaltyValue;
}

const planSchema = baseResourceSchema.extend({
    ownerId: z.guid({ error: "ID do criador do plano é obrigatório" }),
    habitId: z.guid({ error: "ID do hábito é obrigatório" }),
    description: z.string().min(3, { error: "Descrição do plano deve ter ao menos 3 caracteres"}).optional(),
    startsAt: z.string().min(3, { error: "Data de início do plano é obrigatória"}).transform((str) => parseDateOnly(str)),
    endsAt: z.string().min(3, { error: "Data de término do plano é obrigatória"}).transform((str) => parseDateOnly(str)),
    type: planTypeSchema,
    daysOffPerWeek: z.number("Folgas por semana é obrigatório").min(0, { error: "Selecione um número positivo para as folgas por semana" }).max(6, { error: "Selecione até 6 para as folgas por semana" }),
    penaltyValue: penaltyValueSchema,
    isCancelled: z.boolean({ error: "isCancelled deve ser um booleano" }).optional(),
})

export type Plan = z.infer<typeof planSchema>;

export const createPlanSchema = planSchema.omit({ id: true, createdAt: true, isCancelled: true })
export type CreatePlan = z.infer<typeof createPlanSchema>;

//export type UpdatePlan = Partial<Omit<Plan, 'createdAt' | 'ownerId'>>;

export type PlanEnriched = Plan & {
    status: PlanStatus;
    ownerName: string;
    habitName: string;
    memberCount: number;
};

const planMemberSchema = baseResourceSchema.extend({
    planId: z.guid({ error: "ID do plano é obrigatório" }),
    userId: z.guid({ error: "ID do usuário é obrigatório" }),
    joinedAt: z.string().min(3, { error: "Data de entrada no plano é obrigatória" }).transform((str) => parseDateTime(str)),
    status: planMemberStatusSchema,
});
export type PlanMember = z.infer<typeof planMemberSchema>;

export type PlanMemberEnriched = PlanMember & {
    user: User;
    plan: PlanEnriched;
}

export const createOrDeletePlanMemberSchema = planMemberSchema.omit({
    id: true,
    createdAt: true,
    joinedAt: true,
    status: true,
})
export type CreateOrDeletePlanMember = z.infer<typeof createOrDeletePlanMemberSchema>;

export type PlanToJoin = PlanEnriched & {
    joined: boolean;
}