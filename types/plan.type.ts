import { DateOnly, DateTime } from "@/src/utils/dateUtils";

export type PlanType = 'private' | 'public';

export type PlanStatus = 'NotStarted' | 'Running' | 'Finished' | 'Cancelled';

export type PlanParticipantStatus = 'active' | 'left' | 'blocked';

export type DaysOffPerWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Plan = {
    id: string;
    habitId: string;
    description?: string;
    startsAt: DateOnly;
    endsAt: DateOnly;
    status: PlanStatus;
    type: PlanType;
    daysOffPerWeek: DaysOffPerWeek;
    penaltyValue: number;
    createdAt: DateTime;
}

export type CreatePlan = Omit<Plan, 'id' | 'status'/* | 'createdAt'*/>;

export type PlanWithHabit = Plan & {
    habitName: string;
}

export type PlanParticipant = {
    id: string;
    planId: string;
    userId: string;
    joinedAt: DateOnly;
    status: PlanParticipantStatus;
}