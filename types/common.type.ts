import { DateTime } from "@/src/utils/dateUtils";

export type BaseResource = {
  id: string;
  createdAt: DateTime;
}

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
