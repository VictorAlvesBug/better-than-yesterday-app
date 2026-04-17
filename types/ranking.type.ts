export type RankingItem = {
    position: number;
    userId: string;
    penalty: number;
    streak: number;
};

export type RankingItemEnriched = RankingItem & {
    userName: string;
    checkinCount: number;
};