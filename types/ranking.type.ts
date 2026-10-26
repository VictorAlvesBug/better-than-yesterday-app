export type RankingItem = {
    position: number;
    userId: string;
    penalty: number;
    streak: number;
};

export type RankingDay = {
  date: string;
  position: 'Past' | 'Today' | 'Future' | string;
  tone: string;
};

export type RankingItemEnriched = RankingItem & {
    userName: string;
    checkinCount: number;
    pendingCheckinCount: number;
    photoUrl?: string;
    days?: RankingDay[];
};

export type PlanRanking = {
    totalCheckinCount: number;
    daysOffAvailable: number;
    items: RankingItemEnriched[];
};

export type PlanRankingWithCurrentUser = PlanRanking & {
    currentUser: RankingItemEnriched;
};
