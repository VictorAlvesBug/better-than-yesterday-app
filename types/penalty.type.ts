import { parseDateOnly, parseDateTime } from '@/src/utils/dateUtils';
import { zodEnumWithValidation } from '@/src/utils/zodUtils';
import { z } from 'zod';
import { baseResourceSchema } from './common.type';

const penaltyStatusSchema = zodEnumWithValidation(['Pending', 'Paid'] as const, 'Status da multa');
export type PenaltyStatus = z.infer<typeof penaltyStatusSchema>;

const penaltyReasonSchema = zodEnumWithValidation(['MissedCheckIn'] as const, 'Motivo da multa');
export type PenaltyReason = z.infer<typeof penaltyReasonSchema>;

const paymentMethodSchema = zodEnumWithValidation(['Manual', 'Pix'] as const, 'Método de pagamento');
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

const penaltySchema = baseResourceSchema.extend({
  id: z.guid({ error: 'ID da multa é obrigatório' }),
  planId: z.guid({ error: 'ID do plano é obrigatório' }),
  userId: z.guid({ error: 'ID do usuário é obrigatório' }),
  date: z.string().transform((str) => parseDateOnly(str)),
  amount: z.number(),
  status: penaltyStatusSchema,
  reason: penaltyReasonSchema,
  paidAt: z.string().nullable().optional().transform((str) => str ? parseDateTime(str) : undefined),
  paymentMethod: paymentMethodSchema.nullable().optional(),
  externalPaymentId: z.string().nullable().optional(),
  confirmedByUserId: z.guid().nullable().optional(),
});

export type Penalty = z.infer<typeof penaltySchema>;

export type PenaltyEnriched = Penalty & {
  userName?: string;
};
