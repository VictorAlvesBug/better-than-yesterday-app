export type PlanType = 'private' | 'public';

export type PlanStatus = 'NotStarted' | 'Running' | 'Finished' | 'Cancelled';

export type PlanParticipantStatus = 'active' | 'left' | 'blocked';

export type DaysOffPerWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Plan = {
    id: string;
    habitId: string;
    description: string;
    startsAt: string;
    endsAt: string;
    status: PlanStatus;
    type: PlanType;
    daysOffPerWeek: DaysOffPerWeek;
    createdAt: string;
}

export type PlanWithHabit = Plan & {
    habitName: string;
}

export type PlanParticipant = {
    id: string;
    planId: string;
    userId: string;
    joinedAt: string;
    status: PlanParticipantStatus;
}