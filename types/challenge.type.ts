import { parseDateOnly, parseDateTime } from "@/src/utils/dateUtils";
import { formatMoneyCompact } from "@/src/utils/numberUtils";
import { formatEachAndJoin } from "@/src/utils/stringUtils";
import { zodEnumWithValidation } from "@/src/utils/zodUtils";
import { z } from "zod";
import { baseResourceSchema } from "./common.type";
import { User } from "./user.type";


const challengeTypeSchema = zodEnumWithValidation(['Private', 'Public'] as const, "Tipo do desafio");
export type ChallengeType = z.infer<typeof challengeTypeSchema>;

const challengeStatusSchema = zodEnumWithValidation(['NotStarted', 'Running', 'Finished', 'Cancelled'] as const, "Status do desafio");
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;

const challengeMemberStatusSchema = zodEnumWithValidation(['Active', 'Blocked'] as const, "Status do jogador");
export type ChallengeMemberStatus = z.infer<typeof challengeMemberStatusSchema>;


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

const challengeSchema = baseResourceSchema.extend({
    ownerId: z.guid({ error: "Faltou quem cria o desafio" }),
    habitId: z.guid({ error: "ID do hábito é obrigatório" }),
    description: z.string().min(3, { error: "A descrição precisa de pelo menos 3 caracteres"}).optional(),
    startsAt: z.string().min(3, { error: "Escolhe o dia em que o desafio começa"}).transform((str) => parseDateOnly(str)),
    endsAt: z.string().min(3, { error: "Escolhe o dia em que o desafio termina"}).transform((str) => parseDateOnly(str)),
    type: challengeTypeSchema,
    daysOffPerWeek: z.number("Folgas por semana são obrigatórias").min(0, { error: "As folgas não podem ser negativas" }).max(6, { error: "No máximo 6 folgas por semana" }),
    penaltyValue: penaltyValueSchema,
    coverPhotoUrl: z.string().optional(),
    status: challengeStatusSchema,
})

export type Challenge = z.infer<typeof challengeSchema>;

export const createChallengeSchema = challengeSchema.omit({ id: true, createdAt: true, status: true })
export type CreateChallenge = z.infer<typeof createChallengeSchema>;

//export type UpdateChallenge = Partial<Omit<Challenge, 'createdAt' | 'ownerId'>>;

export type ChallengeEnriched = Challenge & {
    status: ChallengeStatus;
    ownerName: string;
    habitName: string;
    memberCount: number;
    amountOwed?: number;
    rewardPool?: number;
};

const challengeMemberSchema = baseResourceSchema.extend({
    challengeId: z.guid({ error: "Faltou o ID do desafio" }),
    userId: z.guid({ error: "ID do usuário é obrigatório" }),
    joinedAt: z.string().min(3, { error: "Faltou a data de entrada no desafio" }).transform((str) => parseDateTime(str)),
    status: challengeMemberStatusSchema,
});
export type ChallengeMember = z.infer<typeof challengeMemberSchema>;

export type ChallengeMemberEnriched = ChallengeMember & {
    user: User;
    challenge: ChallengeEnriched;
}

export const manageChallengeMemberSchema = challengeMemberSchema.omit({
    id: true,
    createdAt: true,
    joinedAt: true,
    status: true,
})
export type ManageChallengeMember = z.infer<typeof manageChallengeMemberSchema>;

export type ChallengeToJoin = ChallengeEnriched & {
    joined: boolean;
}

export type ChallengeWithMembers = {
    challenge: ChallengeEnriched;
    users: User[];
}

export type UserWithChallenges = {
    user: User;
    challenges: ChallengeEnriched[];
}