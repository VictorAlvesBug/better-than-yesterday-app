import { BaseResource } from "./common.type";

export type Habit = BaseResource & {
  name: string;
};

export type SaveHabit = Habit;