
export type BaseResource = {
  id: string;
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

export type Never<T extends object> = {
  [P in keyof T]?: never;
}