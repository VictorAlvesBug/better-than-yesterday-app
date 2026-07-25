export type RankingItem = {
    position: number;
    userId: string;
    penalty: number;
    streak: number;
    streakBonus: number;
};

export type RankingItemEnriched = RankingItem & {
    userName: string;
    checkinCount: number;
    photoUrl?: string;
};

export type PlanRanking = {
    totalCheckinCount: number;
    daysOffAvailable: number;
    items: RankingItemEnriched[];
    currentUser: RankingItemEnriched | null;
};
