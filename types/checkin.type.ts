import { parseDateTime } from "@/src/utils/dateUtils";
import { zodEnumWithValidation, zodExtractWithValidation } from "@/src/utils/zodUtils";
import { z } from "zod";
import { baseResourceSchema } from "./common.type";

const checkinStatusSchema = zodEnumWithValidation(['Pending', 'Validated', 'Rejected'] as const, "Status do check-in");
export type CheckinStatus = z.infer<typeof checkinStatusSchema>;

const reviewStatusOptions = ['Validated', 'Rejected'] as const satisfies CheckinStatus[];
const reviewStatusSchema = zodExtractWithValidation(checkinStatusSchema, reviewStatusOptions, "Status da revisão");

export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

const checkinReviewSchema = z.object({
  reviewerId: z.guid({ error: "ID do revisor é obrigatório" }),
  status: reviewStatusSchema,
});
export type CheckinReview = z.infer<typeof checkinReviewSchema>;

export type CheckinReviewEnriched = CheckinReview & {
  reviewerName: string;
  reviewerPhoto: string;
};

const checkinSchema = baseResourceSchema.extend({
  id: z.guid({ error: "ID do checkin é obrigatório" }),
  kind: z.literal('checkin'),
  planId: z.guid({ error: "ID do plano deve ser um UUID válido" }),
  userId: z.guid({ error: "ID do usuário deve ser um UUID válido" }),
  date: z.string().transform((str) => parseDateTime(str)),
  title: z.string().min(3, { error: "Título é obrigatório" }),
  evidencePhotoUrl: z.string().min(3, { error: "Foto é obrigatória" }),
  status: checkinStatusSchema,
  reviews: z.array(checkinReviewSchema),
});
export type Checkin = z.infer<typeof checkinSchema>;

export type CheckinEnriched = Checkin & {
  planName: string;
  userName: string;
  userPhotoUrl?: string;
};

export const createCheckinSchema = checkinSchema.omit({
  id: true,
  kind: true,
  createdAt: true,
  status: true,
  reviews: true
});
export type CreateCheckin = z.infer<typeof createCheckinSchema>;

export function isCheckin(checkin: Checkin): checkin is Checkin {
  return checkin.kind === 'checkin';
}
