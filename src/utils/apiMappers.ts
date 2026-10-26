import { Penalty } from '@/types/penalty.type';
import { Checkin, CheckinEnriched, CheckinReview, CheckinStatus, CreateCheckin } from '@/types/checkin.type';
import { ChallengeRanking, ChallengeRankingWithCurrentUser, RankingItemEnriched } from '@/types/ranking.type';
import { CreateHabit, Habit, HabitEnriched } from '@/types/habit.type';
import {
  CreateChallenge,
  Challenge,
  ChallengeEnriched,
  ChallengeMember,
  ChallengeMemberEnriched,
  ChallengeMemberStatus,
  ChallengeStatus,
  ChallengeType,
  ChallengeWithMembers,
  UserWithChallenges,
} from '@/types/challenge.type';
import { CreateUser, PixKeyType, User } from '@/types/user.type';
import { AllTypes, DateOnly, DateTime, getDateOnly, getDateTime, parseDateTime, isDateTime } from '@/src/utils/dateUtils';

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

export type ApiChallenge = {
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
  coverPhotoUrl?: string | null;
  amountOwed?: number;
  rewardPool?: number;
  createdAt: string;
};

export type ApiReview = {
  reviewerId: string;
  status: string;
  date: string;
  enable?: boolean;
};

export type ApiCheckIn = {
  id: string;
  challengeId: string;
  challengeName: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string | null;
  date: string;
  index: number;
  title: string;
  evidencePhotoUrl: string;
  status: string;
  reviews: ApiReview[];
  createdAt: string;
  reviewClosesAt?: string;
  isReplacement?: boolean;
};

export type ApiChallengeMemberDetails = {
  id: string;
  joinedAt: string;
  status: string;
  challenge: ApiChallenge;
  user: ApiUser;
};

export type ApiChallengeWithMembers = {
  challenge: ApiChallenge;
  users: ApiUser[];
};

export type ApiUserWithChallenges = {
  user: ApiUser;
  challenges: ApiChallenge[];
};

export type PresignedUploadUrl = {
  uploadUrl: string;
  fileUrl: string;
};

export type ApiChallengeRankingItem = {
  position: number;
  userId: string;
  userName: string;
  photoUrl?: string | null;
  checkinCount: number;
  pendingCheckinCount: number;
  penalty: number;
  streak: number;
  days?: { date: string; position: string; tone: string }[];
};

export type ApiChallengeRanking = {
  totalCheckinCount: number;
  daysOffAvailable: number;
  items: ApiChallengeRankingItem[];
};

export type ApiChallengeRankingWithCurrentUser = ApiChallengeRanking & {
  currentUser: ApiChallengeRankingItem;
};

export type ApiPenalty = {
  id: string;
  challengeId: string;
  userId: string;
  date: string;
  amount: number;
  status: string;
  reason: string;
  createdAt: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  externalPaymentId?: string | null;
  confirmedByUserId?: string | null;
};

export function mapPenaltyFromApi(penalty: ApiPenalty): Penalty {
  const dateOnly = isDateTime(penalty.date)
    ? getDateOnly(penalty.date)
    : penalty.date as DateOnly;

  return {
    id: penalty.id,
    challengeId: penalty.challengeId,
    userId: penalty.userId,
    date: dateOnly,
    amount: penalty.amount,
    status: penalty.status as Penalty['status'],
    reason: penalty.reason as Penalty['reason'],
    createdAt: parseDateTime(penalty.createdAt),
    paidAt: penalty.paidAt ? parseDateTime(penalty.paidAt) : undefined,
    paymentMethod: penalty.paymentMethod as Penalty['paymentMethod'],
    externalPaymentId: penalty.externalPaymentId ?? undefined,
    confirmedByUserId: penalty.confirmedByUserId ?? undefined,
  };
}

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

export function mapChallengeFromApi(challenge: ApiChallenge, memberCount = 0): ChallengeEnriched {
  return {
    id: challenge.id,
    ownerId: challenge.ownerId,
    habitId: challenge.habitId,
    description: challenge.description ?? undefined,
    startsAt: challenge.startsAt as DateOnly,
    endsAt: challenge.endsAt as DateOnly,
    type: challenge.type as ChallengeType,
    daysOffPerWeek: challenge.daysOffPerWeek,
    penaltyValue: challenge.penaltyValue as ChallengeEnriched['penaltyValue'],
    coverPhotoUrl: challenge.coverPhotoUrl ?? undefined,
    status: challenge.status as ChallengeStatus,
    createdAt: challenge.createdAt as DateTime,
    ownerName: challenge.ownerName,
    habitName: challenge.habitName,
    memberCount,
    amountOwed: challenge.amountOwed ?? 0,
    rewardPool: challenge.rewardPool ?? 0,
  };
}

export function mapCheckInFromApi(checkIn: ApiCheckIn): Checkin {
  return {
    id: checkIn.id,
    kind: 'checkin',
    challengeId: checkIn.challengeId,
    userId: checkIn.userId,
    date: getDateTime(checkIn.date as AllTypes) as DateTime,
    title: checkIn.title,
    evidencePhotoUrl: checkIn.evidencePhotoUrl?.trim() ?? '',
    status: checkIn.status as CheckinStatus,
    reviews: checkIn.reviews
      .filter((review) => review.enable !== false)
      .map((review) => ({
      reviewerId: review.reviewerId,
      status: review.status as CheckinReview['status'],
    })),
    createdAt: checkIn.createdAt as DateTime,
    reviewClosesAt: checkIn.reviewClosesAt,
    isReplacement: checkIn.isReplacement ?? false,
  };
}

export function mapCheckInEnrichedFromApi(checkIn: ApiCheckIn): CheckinEnriched {
  return {
    ...mapCheckInFromApi(checkIn),
    challengeName: checkIn.challengeName,
    userName: checkIn.userName,
    userPhotoUrl: checkIn.userPhotoUrl ?? undefined,
  };
}

export function mapChallengeMemberFromDetails(details: ApiChallengeMemberDetails): ChallengeMember {
  return {
    id: details.id,
    challengeId: details.challenge.id,
    userId: details.user.id,
    joinedAt: details.joinedAt as DateTime,
    status: details.status as ChallengeMemberStatus,
    createdAt: details.joinedAt as DateTime,
  };
}

export function mapChallengeMemberEnrichedFromDetails(details: ApiChallengeMemberDetails): ChallengeMemberEnriched {
  const challenge = mapChallengeFromApi(details.challenge);
  const user = mapUserFromApi(details.user);

  return {
    ...mapChallengeMemberFromDetails(details),
    user,
    challenge,
  };
}

export function mapChallengeWithMembersFromApi(data: ApiChallengeWithMembers): ChallengeWithMembers {
  return {
    challenge: mapChallengeFromApi(data.challenge, data.users.length),
    users: data.users.map(mapUserFromApi),
  };
}

export function mapUserWithChallengesFromApi(data: ApiUserWithChallenges): UserWithChallenges {
  return {
    user: mapUserFromApi(data.user),
    challenges: data.challenges.map((challenge) => mapChallengeFromApi(challenge)),
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
    challengeCount: 0,
  };
}

function mapChallengeRankingItemFromApi(item: ApiChallengeRankingItem): RankingItemEnriched {
  return {
    position: item.position,
    userId: item.userId,
    userName: item.userName,
    photoUrl: item.photoUrl ?? undefined,
    checkinCount: item.checkinCount,
    pendingCheckinCount: item.pendingCheckinCount ?? 0,
    penalty: item.penalty,
    streak: item.streak,
    days: item.days ?? [],
  };
}

export function mapChallengeRankingFromApi(ranking: ApiChallengeRanking): ChallengeRanking {
  return {
    totalCheckinCount: ranking.totalCheckinCount,
    daysOffAvailable: ranking.daysOffAvailable,
    items: ranking.items.map(mapChallengeRankingItemFromApi),
  };
}

export function mapChallengeRankingWithCurrentUserFromApi(ranking: ApiChallengeRankingWithCurrentUser): ChallengeRankingWithCurrentUser {
  return {
    totalCheckinCount: ranking.totalCheckinCount,
    daysOffAvailable: ranking.daysOffAvailable,
    items: ranking.items.map(mapChallengeRankingItemFromApi),
    currentUser: mapChallengeRankingItemFromApi(ranking.currentUser),
  };
}

export type CreateCheckInPayload = CreateCheckin;
export type CreateChallengePayload = CreateChallenge;
export type CreateUserPayload = CreateUser;
export type CreateHabitPayload = CreateHabit;
export type UpdateUserPayload = {
  userId: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  nickname?: string;
  phoneNumber?: string;
  pixKey?: string;
  pixKeyType?: string;
};

export type ReviewCheckInPayload = {
  reviewerId: string;
  status: CheckinReview['status'];
  date: string;
};

export type ListChallengesFilter = Partial<Pick<Challenge, 'ownerId' | 'habitId' | 'status' | 'type'>>;
export type ListCheckInsFilter = Partial<Pick<Checkin, 'challengeId' | 'userId' | 'status'>> & { date?: string };export type ListUsersFilter = Partial<Pick<User, 'email'>>;
export type ListHabitsFilter = Partial<Pick<Habit, 'name'>>;
