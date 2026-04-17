import { BaseResource } from "./common.type";

export type Habit = BaseResource & {
  name: string;
};

export type HabitEnriched = Habit & {
  planCount: number;
};

export type CreateHabit = Omit<Habit, 'id' | 'createdAt'>;

export type HabitWithJustAdded = Habit & { justAdded?: boolean };