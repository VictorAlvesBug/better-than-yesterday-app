import { Checkin, CheckinEnriched, CheckinReview, CheckinStatus, CreateCheckin } from '@/types/checkin.type';
import { PlanRanking, RankingItemEnriched } from '@/types/ranking.type';
import { CreateHabit, Habit, HabitEnriched } from '@/types/habit.type';
import {
  CreatePlan,
  Plan,
  PlanEnriched,
  PlanMember,
  PlanMemberEnriched,
  PlanMemberStatus,
  PlanStatus,
  PlanType,
  PlanWithMembers,
  UserWithPlans,
} from '@/types/plan.type';
import { CreateUser, PixKeyType, User } from '@/types/user.type';
import { DateOnly, DateTime } from '@/src/utils/dateUtils';

export type ApiHabit = {
  id: string;
  name: string;
  createdAt: string;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  nickname: string;
  phoneNumber: string;
  pixKey: string;
  pixKeyType: string;
  createdAt: string;
};

export type ApiPlan = {
  id: string;
  ownerId: string;
  ownerName: string;
  habitId: string;
  habitName: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  type: string;
  daysOffPerWeek: number;
  penaltyValue: number;
  createdAt: string;
};

export type ApiReview = {
  reviewerId: string;
  status: string;
  date: string;
};

export type ApiCheckIn = {
  id: string;
  planId: string;
  planName: string;
  userId: string;
  userName: string;
  date: string;
  index: number;
  title: string;
  photoUrl: string;
  status: string;
  reviews: ApiReview[];
  createdAt: string;
};

export type ApiPlanMemberDetails = {
  id: string;
  joinedAt: string;
  status: string;
  plan: ApiPlan;
  user: ApiUser;
};

export type ApiPlanWithMembers = {
  plan: ApiPlan;
  users: ApiUser[];
};

export type ApiUserWithPlans = {
  user: ApiUser;
  plans: ApiPlan[];
};

export type PresignedUploadUrl = {
  uploadUrl: string;
  fileUrl: string;
};

export type ApiPlanRankingItem = {
  position: number;
  userId: string;
  userName: string;
  checkinCount: number;
  penalty: number;
  streak: number;
};

export type ApiPlanRanking = {
  totalCheckinCount: number;
  daysOffAvailable: number;
  items: ApiPlanRankingItem[];
  currentUser: ApiPlanRankingItem | null;
};

export type ApiUseDayOffResult = {
  dayOff: {
    id: string;
    planId: string;
    userId: string;
    date: string;
    createdAt: string;
  };
  daysOffAvailable: number;
};

export function mapUserFromApi(user: ApiUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl ?? '',
    nickname: user.nickname,
    phoneNumber: user.phoneNumber,
    pixKey: user.pixKey,
    pixKeyType: user.pixKeyType as PixKeyType,
    createdAt: user.createdAt as DateTime,
  };
}

export function mapPlanFromApi(plan: ApiPlan, memberCount = 0): PlanEnriched {
  return {
    id: plan.id,
    ownerId: plan.ownerId,
    habitId: plan.habitId,
    description: plan.description ?? undefined,
    startsAt: plan.startsAt as DateOnly,
    endsAt: plan.endsAt as DateOnly,
    type: plan.type as PlanType,
    daysOffPerWeek: plan.daysOffPerWeek,
    penaltyValue: plan.penaltyValue as PlanEnriched['penaltyValue'],
    status: plan.status as PlanStatus,
    createdAt: plan.createdAt as DateTime,
    ownerName: plan.ownerName,
    habitName: plan.habitName,
    memberCount,
  };
}

export function mapCheckInFromApi(checkIn: ApiCheckIn): Checkin {
  return {
    id: checkIn.id,
    kind: 'checkin',
    planId: checkIn.planId,
    userId: checkIn.userId,
    date: checkIn.date as DateOnly,
    title: checkIn.title,
    photoUrl: checkIn.photoUrl,
    status: checkIn.status as CheckinStatus,
    reviews: checkIn.reviews.map((review) => ({
      reviewerId: review.reviewerId,
      status: review.status as CheckinReview['status'],
    })),
    createdAt: checkIn.createdAt as DateTime,
  };
}

export function mapCheckInEnrichedFromApi(checkIn: ApiCheckIn): CheckinEnriched {
  return {
    ...mapCheckInFromApi(checkIn),
    planName: checkIn.planName,
    userName: checkIn.userName,
  };
}

export function mapPlanMemberFromDetails(details: ApiPlanMemberDetails): PlanMember {
  return {
    id: details.id,
    planId: details.plan.id,
    userId: details.user.id,
    joinedAt: details.joinedAt as DateTime,
    status: details.status as PlanMemberStatus,
    createdAt: details.joinedAt as DateTime,
  };
}

export function mapPlanMemberEnrichedFromDetails(details: ApiPlanMemberDetails): PlanMemberEnriched {
  const plan = mapPlanFromApi(details.plan);
  const user = mapUserFromApi(details.user);

  return {
    ...mapPlanMemberFromDetails(details),
    user,
    plan,
  };
}

export function mapPlanWithMembersFromApi(data: ApiPlanWithMembers): PlanWithMembers {
  return {
    plan: mapPlanFromApi(data.plan, data.users.length),
    users: data.users.map(mapUserFromApi),
  };
}

export function mapUserWithPlansFromApi(data: ApiUserWithPlans): UserWithPlans {
  return {
    user: mapUserFromApi(data.user),
    plans: data.plans.map((plan) => mapPlanFromApi(plan)),
  };
}

export function mapHabitFromApi(habit: ApiHabit): Habit {
  return {
    id: habit.id,
    name: habit.name,
    createdAt: habit.createdAt as DateTime,
  };
}

export function mapHabitEnrichedFromApi(habit: ApiHabit): HabitEnriched {
  return {
    ...mapHabitFromApi(habit),
    planCount: 0,
  };
}

function mapPlanRankingItemFromApi(item: ApiPlanRankingItem): RankingItemEnriched {
  return {
    position: item.position,
    userId: item.userId,
    userName: item.userName,
    checkinCount: item.checkinCount,
    penalty: item.penalty,
    streak: item.streak,
  };
}

export function mapPlanRankingFromApi(ranking: ApiPlanRanking): PlanRanking {
  return {
    totalCheckinCount: ranking.totalCheckinCount,
    daysOffAvailable: ranking.daysOffAvailable,
    items: ranking.items.map(mapPlanRankingItemFromApi),
    currentUser: ranking.currentUser ? mapPlanRankingItemFromApi(ranking.currentUser) : null,
  };
}

export type CreateCheckInPayload = CreateCheckin;
export type CreatePlanPayload = CreatePlan;
export type CreateUserPayload = CreateUser;
export type CreateHabitPayload = CreateHabit;

export type ReviewCheckInPayload = {
  reviewerId: string;
  status: CheckinReview['status'];
  date: string;
};

export type ListPlansFilter = Partial<Pick<Plan, 'ownerId' | 'habitId' | 'status' | 'type'>>;
export type ListCheckInsFilter = Partial<Pick<Checkin, 'planId' | 'userId' | 'status'>> & { date?: string };export type ListUsersFilter = Partial<Pick<User, 'email'>>;
export type ListHabitsFilter = Partial<Pick<Habit, 'name'>>;
