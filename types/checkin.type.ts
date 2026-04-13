import { DateTime } from "@/src/utils/dateUtils";
import { BaseResource } from "./common.type";

export type CheckinStatus = 'Pending' | 'Validated' | 'Rejected';

type ReviewStatus = Exclude<CheckinStatus, 'Pending'>;

export type CheckinReview = {
    status: ReviewStatus;
};

export type Checkin = BaseResource & {
  planId: string;
  userId: string;
  name: string;
  dateTime: DateTime;
  title: string;
  photoUrl: string;
  status: CheckinStatus;
  reviews: CheckinReview[];
};