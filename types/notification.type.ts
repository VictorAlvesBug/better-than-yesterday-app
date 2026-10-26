export type NotificationPayload =
  | { type: 'CheckInReviewed'; challengeId: string; checkInId: string; reviewerId: string }
  | { type: 'CheckInRejectionRisk'; challengeId: string; checkInId: string }
  | { type: 'CheckInMade'; challengeId: string; checkInId: string; authorId: string }
  | { type: 'CheckInReported'; challengeId: string; checkInId: string; reporterId: string; targetUserId: string }
  | { type: 'RestAtRisk'; challengeId: string }
  | { type: 'FineAtRisk'; challengeId: string }
  | { type: 'ChallengeStartsToday'; challengeId: string }
  | { type: 'ChallengeCancelledForQuorum'; challengeId: string };

export function notificationCheckInId(payload: NotificationPayload | undefined): string | undefined {
  if (!payload || !('checkInId' in payload))
    return undefined;

  return payload.checkInId;
}
