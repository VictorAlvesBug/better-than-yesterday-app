

const colors = {
  // Bootstrap Colors
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

  // Gray Scale (from white to black)
  white: "#ffffff",
  "gray-e": "#eeeeee",
  "gray-d": "#dddddd",
  "gray-c": "#cccccc",
  "gray-b": "#bbbbbb",
  "gray-a": "#aaaaaa",
  "gray-9": "#999999",
  "gray-8": "#888888",
  "gray-7": "#777777",
  "gray-6": "#666666",
  "gray-5": "#555555",
  "gray-4": "#444444",
  "gray-3": "#333333",
  "gray-2": "#222222",
  "gray-1": "#111111",
  black: "#000000",

  // Custom Colors
  violet: "#9810fa",
  "light-violet": "#a250fb",
  purple: "#5038f6",
  'light-purple': "#eb9fff",
  "purple-violet": "#8100d9",
  gold: "#ffd43b",
  silver: "#a6aab4",
  bronze: "#c77c30",
  lime: "#00cf51",
  opaque: "#ffffff20",
  accent: "#7e22ce",
  "light-accent": "#e9d5ff",

  // Transparent
  transparent: "#00000000"
} as const;

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