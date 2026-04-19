import { parseDateTime } from "@/src/utils/dateUtils";
import { z } from "zod";

export const baseResourceSchema = z.object({
  id: z.guid({ error: "ID deve ser um UUID válido" }),
  createdAt: z.string({ error: "Data de criação é obrigatória"}).transform((str) => parseDateTime(str)),
});
export type BaseResource = z.infer<typeof baseResourceSchema>;

export type TextSize =
  | "text-xs"   // 12px
  | "text-sm"   // 14px  
  | "text-base" // 16px
  | "text-lg"   // 18px
  | "text-xl"   // 20px
  | "text-2xl"  // 24px
  | "text-3xl"  // 30px
  | "text-4xl"  // 36px
  | "text-5xl"  // 48px
  | "text-6xl"; // 60px