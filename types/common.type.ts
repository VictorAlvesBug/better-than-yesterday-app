import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";

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

export type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
export type FontAwesomeName = React.ComponentProps<typeof FontAwesome>['name'];
export type FontAwesome5Name = React.ComponentProps<typeof FontAwesome5>['name'];
export type FontAwesome6Name = React.ComponentProps<typeof FontAwesome6>['name'];