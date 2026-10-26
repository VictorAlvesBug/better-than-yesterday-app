export type NotificationPayload =
  | { type: 'CheckInReviewed'; planId: string; checkInId: string; reviewerId: string }
  | { type: 'CheckInRejectionRisk'; planId: string; checkInId: string }
  | { type: 'CheckInMade'; planId: string; checkInId: string; authorId: string }
  | { type: 'CheckInReported'; planId: string; checkInId: string; reporterId: string; targetUserId: string }
  | { type: 'RestAtRisk'; planId: string }
  | { type: 'FineAtRisk'; planId: string }
  | { type: 'PlanStartsToday'; planId: string }
  | { type: 'PlanCancelledForQuorum'; planId: string };

export function notificationCheckInId(payload: NotificationPayload | undefined): string | undefined {
  if (!payload || !('checkInId' in payload))
    return undefined;

  return payload.checkInId;
}
