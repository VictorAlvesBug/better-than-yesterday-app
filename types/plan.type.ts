import { DateOnly, DateTime } from "@/src/utils/dateUtils";
import { BaseResource } from "./common.type";
import { User } from "./user.type";

export type PlanType = 'private' | 'public';

export type PlanStatus = 'not-started' | 'running' | 'finished' | 'cancelled';

export type PlanMemberStatus = 'active' | 'left' | 'blocked';

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
    type: PlanType;
    daysOffPerWeek: number;
    penaltyValue: PenaltyValue;
    isCancelled?: boolean;
}

export type CreatePlan = Omit<Plan, 'id' | 'createdAt' | 'isCancelled'>;

//export type UpdatePlan = Partial<Omit<Plan, 'createdAt' | 'ownerId'>>;

export type PlanEnriched = Plan & {
    status: PlanStatus;
    ownerName: string;
    habitName: string;
    memberCount: number;
};

export type PlanMember = BaseResource & {
    planId: string;
    userId: string;
    joinedAt: DateTime;
    leftAt?: DateTime;
    status: PlanMemberStatus;
}

export type PlanMemberEnriched = PlanMember & {
    user: User;
    plan: PlanEnriched;
}

export type CreateOrDeletePlanMember = Omit<PlanMember, 'id' | 'createdAt' | 'joinedAt' | 'leftAt' | 'status'>;

export type PlanToJoin = PlanEnriched & {
    joined: boolean;
}