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

export type ColorPair = {
  base: string;
  light: string;
}

type Colors = {
  [key: string]: ColorPair;
}

const colors: Colors = {
  accent: {
    base: "#7e22ce",
    light: "#e9d5ff"
  },
  primary: {
    base: "#0d6efd",
    light: "#cfe2ff"
  },
  secondary: {
    base: "#6c757d",
    light: "#e2e3e5"
  },
  success: {
    base: "#198754",
    light: "#d1e7dd"
  },
  info: {
    base: "#0dcaf0",
    light: "#cff4fc"
  },
  warning: {
    base: "#ffc107",
    light: "#fff3cd"
  },
  danger: {
    base: "#dc3545",
    light: "#f8d7da"
  },
  light: {
    base: "#f8f9fa",
    light: "#fefefe"
  },
  dark: {
    base: "#212529",
    light: "#e2e3e5"
  },
} as const;

export type ColorKey = keyof typeof colors;

export type ColorSet = {
  textBase: string;
  textLight: string;
  backgroundBase: string;
  backgroundLight: string;
  borderBase: string;
  borderLight: string;
}

export const getColorSet = (color: ColorKey | ColorSet): ColorSet => {
  if (color && typeof color === 'object')
    return color;
  return {
    textBase: colors[color].base,
    textLight: colors[color].light,
    backgroundBase: colors[color].base,
    backgroundLight: colors[color].light,
    borderBase: colors[color].base,
    borderLight: colors[color].light,
  } as ColorSet;
}

export const getColor = (colorName: ColorKey): ColorPair => {
  return colors[colorName];
}