export type RankingItem = {
    position: number; // TODO: Create type for PositiveInteger, PositiveIntegerOrZero, ...
    name: string;
    checkinsCount: number;
    penalty: number;
    streak: number;
};