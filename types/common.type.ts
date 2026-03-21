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

type BasicColor = {
  base: string;
  light: string;
}

type BasicColors = {
  [key: string]: BasicColor;
}

const basicColors = {
  "accent": "#7e22ce",
  "light-accent": "#e9d5ff",
  "primary": "#0d6efd",
  "light-primary": "#cfe2ff",
  "secondary": "#6c757d",
  "light-secondary": "#e2e3e5",
  "success": "#198754",
  "light-success": "#d1e7dd",
  "info": "#0dcaf0",
  "light-info": "#cff4fc",
  "warning": "#ffc107",
  "light-warning": "#fff3cd",
  "danger": "#dc3545",
  "light-danger": "#f8d7da",
  "light": "#f8f9fa",
  "light-light": "#fefefe",
  "dark": "#212529",
  "light-dark": "#e2e3e5",
} as const;

const otherColors = {
  violet: "#8f10ed",
  "light-violet": "#a250fb",
  purple: "#5038f6",
  gold: "#ffd941",
  silver: "#a6aab4",
  bronze: "#c77c30",
  black: "#000000",
  white: "#ffffff",
  gray: "#777777",
  "dark-gray": "#333333",
  "light-gray": "#aaaaaa",
  lime: "#00cf51",
  opaque: "#ffffff20"
} as const;

const colors = { ...basicColors, ...otherColors }

type Colors = typeof colors;

export type ColorName = keyof Colors;

export const getColor = (colorName: keyof Colors): string => {
  return colors[colorName];
}

export const getLightColor = (colorName: keyof Colors): string => {
  const lightColorName = `light-${colorName}` as keyof typeof colors;
  if (lightColorName in colors)
    return colors[lightColorName]
  return "white";//getColor(colorName);
}