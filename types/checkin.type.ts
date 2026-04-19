import { parseDateTime } from "@/src/utils/dateUtils";
import { zodEnumWithValidation, zodExtractWithValidation } from "@/src/utils/zodUtils";
import { z } from "zod";
import { baseResourceSchema } from "./common.type";

const checkinStatusSchema = zodEnumWithValidation(['pending', 'validated', 'rejected'] as const, "Status do check-in");
export type CheckinStatus = z.infer<typeof checkinStatusSchema>;

const reviewStatusOptions = ['validated', 'rejected'] as const satisfies CheckinStatus[];
const reviewStatusSchema = zodExtractWithValidation(checkinStatusSchema, reviewStatusOptions, "Status da revisão");

export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

const checkinReviewSchema = z.object({
  reviewerId: z.string({ error: "ID do revisor é obrigatório" }),
  status: reviewStatusSchema,
});
export type CheckinReview = z.infer<typeof checkinReviewSchema>;

export type CheckinReviewEnriched = CheckinReview & {
  reviewerName: string;
  reviewerPhoto: string;
};

const checkinSchema = baseResourceSchema.extend({
  kind: z.literal('checkin'),
  planId: z.guid({ error: "ID do plano deve ser um UUID válido" }),
  userId: z.guid({ error: "ID do usuário deve ser um UUID válido" }),
  dateTime: z.string({ error: "Data e hora são obrigatórias" }).transform((str) => parseDateTime(str)),
  title: z.string({ error: "Título é obrigatório" }),
  photoUrl: z.string({ error: "Foto é obrigatória" }),
  status: checkinStatusSchema,
  reviews: z.array(checkinReviewSchema),
});
export type Checkin = z.infer<typeof checkinSchema>;

export type CheckinEnriched = Checkin & {
  planName: string;
  userName: string;
};

export const createCheckinSchema = checkinSchema.omit({
  kind: true,
  id: true,
  createdAt: true,
  status: true,
  reviews: true
});
export type CreateCheckin = z.infer<typeof createCheckinSchema>;

const dayOffSchema = baseResourceSchema.extend({
  kind: z.literal('dayoff'),
  planId: z.string({ error: "ID do plano é obrigatório" }),
  userId: z.string({ error: "ID do usuário é obrigatório" }),
  dateTime: z.string({ error: "Data e hora são obrigatórias" }).transform((str) => parseDateTime(str)),
});
export type DayOff = z.infer<typeof dayOffSchema>;


export type DayOffEnriched = DayOff & {
  planName: string;
  userName: string;
};

export const createDayOffSchema = dayOffSchema.omit({
  kind: true,
  id: true,
  createdAt: true,
});
export type CreateDayOff = z.infer<typeof createDayOffSchema>;

const checkinOrDayOffSchema = z.discriminatedUnion('kind', [
  checkinSchema,
  dayOffSchema,
]);
export type CheckinOrDayOff = z.infer<typeof checkinOrDayOffSchema>;

export type CheckinOrDayOffEnriched = CheckinEnriched | DayOffEnriched;

export function isCheckin(checkinOrDayOff: CheckinOrDayOff): checkinOrDayOff is Checkin {
  return checkinOrDayOff.kind === 'checkin';
}

export function isDayOff(checkinOrDayOff: CheckinOrDayOff): checkinOrDayOff is DayOff {
  return checkinOrDayOff.kind === 'dayoff';
}