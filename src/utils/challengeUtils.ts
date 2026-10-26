import { Href } from 'expo-router';
import { AllTypes, getDateOnlyWithOffset, getDifferenceInDays } from './dateUtils';

type DuplicateSource = {
  habitId: string;
  description?: string;
  type: string;
  daysOffPerWeek: number;
  penaltyValue: number;
  startsAt: AllTypes;
  endsAt: AllTypes;
  coverPhotoUrl?: string;
};

export function duplicateChallengePath(challenge: DuplicateSource): Href {
  const duration = getDifferenceInDays(challenge.startsAt, challenge.endsAt);
  const startsAt = getDateOnlyWithOffset(1);
  const endsAt = getDateOnlyWithOffset(duration + 1);
  const query = new URLSearchParams({
    habitId: challenge.habitId,
    description: challenge.description ?? '',
    type: challenge.type,
    daysOffPerWeek: String(challenge.daysOffPerWeek),
    penaltyValue: String(challenge.penaltyValue),
    startsAt,
    endsAt,
    coverPhotoUrl: challenge.coverPhotoUrl ?? '',
  });

  return `/create-challenge?${query.toString()}` as Href;
}

export function penaltyScale(value: number) {
  if (value >= 50)
    return '$$$';
  if (value >= 10)
    return '$$';
  return '$';
}

export function commitmentLabel(daysOffPerWeek: number) {
  return `${7 - daysOffPerWeek}/7`;
}

export function elapsedPercent(startsAt: AllTypes, endsAt: AllTypes, today: AllTypes) {
  if (today <= startsAt)
    return 0;
  if (today >= endsAt)
    return 100;

  const total = getDifferenceInDays(startsAt, endsAt);
  if (total <= 0)
    return 0;

  return Math.min(100, Math.max(0, Math.round((getDifferenceInDays(startsAt, today) / total) * 100)));
}
