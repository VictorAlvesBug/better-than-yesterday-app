export type CheckinStatus = 'Pending' | 'Validated' | 'Rejected';

type ReviewStatus = Exclude<CheckinStatus, 'Pending'>;

export type CheckinReview = {
    status: ReviewStatus;
};

export type Checkin = {
  id: string;
  planId: string;
  userId: string;
  name: string;
  date: string;
  title: string;
  photoUrl: string;
  status: CheckinStatus;
  reviews: CheckinReview[];
};