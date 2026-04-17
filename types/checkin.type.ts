import { DateTime } from "@/src/utils/dateUtils";
import { BaseResource } from "./common.type";

export type CheckinStatus = 'pending' | 'validated' | 'rejected';

type ReviewStatus = Extract<CheckinStatus, 'validated' | 'rejected'>;

export type CheckinReview = {
  reviewerId: string;
  status: ReviewStatus;
};

export type CheckinReviewEnriched = CheckinReview & {
  reviewerName: string;
  reviewerPhoto: string;
};

export type Checkin = BaseResource & {
  kind: 'checkin';
  planId: string;
  userId: string;
  dateTime: DateTime;
  title: string;
  photoUrl: string;
  status: CheckinStatus;
  reviews: CheckinReview[];
};

export type CheckinEnriched = Checkin & {
  planName: string;
  userName: string;
};

export type CreateCheckin = Omit<Checkin, 'kind' | 'id' | 'createdAt' | 'status' | 'reviews'>;

export type DayOff = BaseResource & {
  kind: 'dayoff';
  planId: string;
  userId: string;
  dateTime: DateTime;
}

export type DayOffEnriched = DayOff & {
  planName: string;
  userName: string;
};

export type CreateDayOff = Omit<DayOff, 'kind' | 'id' | 'createdAt'>;

export type CheckinOrDayOff = Checkin | DayOff;

export type CheckinOrDayOffEnriched = CheckinEnriched | DayOffEnriched;

export function isCheckin(checkinOrDayOff: CheckinOrDayOff): checkinOrDayOff is Checkin {
  return checkinOrDayOff.kind === 'checkin';
}

export function isDayOff(checkinOrDayOff: CheckinOrDayOff): checkinOrDayOff is DayOff {
  return checkinOrDayOff.kind === 'dayoff';
}