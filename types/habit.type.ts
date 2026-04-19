import { z } from "zod";
import { baseResourceSchema } from "./common.type";

const habitSchema = baseResourceSchema.extend({
  name: z.string({ error: "Nome do hábito é obrigatório" }),
});
export type Habit = z.infer<typeof habitSchema>;

export type HabitEnriched = Habit & {
  planCount: number;
};

export const createHabitSchema = habitSchema.omit({ id: true, createdAt: true })
export type CreateHabit = z.infer<typeof createHabitSchema>;

export const habitWithJustAddedSchema = habitSchema.extend({
  justAdded: z.boolean({ error: "justAdded deve ser um booleano" }).optional(),
});
export type HabitWithJustAdded = z.infer<typeof habitWithJustAddedSchema>;