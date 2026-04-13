import { DateOnly, DateTime } from "@/src/utils/dateUtils";
import { BaseResource } from "./common.type";

export type PlanType = 'private' | 'public';

export type PlanStatus = 'NotStarted' | 'Running' | 'Finished' | 'Cancelled';

export type PlanParticipantStatus = 'active' | 'left' | 'blocked';

export const daysOffPerWeekOptions = [0, 1, 2, 3, 4, 5, 6] as const;

export type DaysOffPerWeek = typeof daysOffPerWeekOptions[number];

export const penaltyValueOptions = [1, 5, 10, 20, 50, 100] as const;

export type PenaltyValue = typeof penaltyValueOptions[number];

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

export type Plan = BaseResource & {
    ownerId: string;
    habitId: string;
    description?: string;
    startsAt: DateOnly;
    endsAt: DateOnly;
    status: PlanStatus;
    type: PlanType;
    daysOffPerWeek: number;//DaysOffPerWeek;
    penaltyValue: PenaltyValue;
    createdAt: DateTime;
    isCancelled?: boolean;
}

export type CreatePlan = Omit<Plan, 'id' | 'status'/* | 'createdAt'*/>;

type WithEnrichment = {
    habitName: string;
    ownerName: string;
    memberCount: number;
}

export type PlanEnriched = Plan & WithEnrichment;

export type PlanParticipant = BaseResource & {
    planId: string;
    userId: string;
    joinedAt: DateTime;
    leftAt?: DateTime;
    status: PlanParticipantStatus;
}

export type PlanToJoin = PlanEnriched & {
    joined: boolean;
}