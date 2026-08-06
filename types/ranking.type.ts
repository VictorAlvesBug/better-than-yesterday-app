export type RankingItem = {
    position: number;
    userId: string;
    penalty: number;
    streak: number;
};

export type RankingItemEnriched = RankingItem & {
    userName: string;
    checkinCount: number;
    pendingCheckinCount: number;
    photoUrl?: string;
};

export type PlanRanking = {
    totalCheckinCount: number;
    daysOffAvailable: number;
    items: RankingItemEnriched[];
};

export type PlanRankingWithCurrentUser = PlanRanking & {
    currentUser: RankingItemEnriched;
};
