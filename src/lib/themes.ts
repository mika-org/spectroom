import type { Theme } from "@/generated/prisma/enums";

type ThemeStyle = { label: string; gradient: string; planet: string; ring: string };

export const THEMES: Record<Theme, ThemeStyle> = {
  SUNSET: { label: "Sunset", gradient: "linear-gradient(135deg,#ff7a59 0%,#ffb44c 50%,#ffe066 100%)", planet: "#ffd84d", ring: "#ff7a59" },
  GRAPE: { label: "Grape", gradient: "linear-gradient(135deg,#8e5cf7 0%,#c264e6 50%,#f28ac4 100%)", planet: "#ff7a59", ring: "#ffd84d" },
  OCEAN: { label: "Ocean", gradient: "linear-gradient(135deg,#1d4f91 0%,#2f86c9 50%,#7cc8ee 100%)", planet: "#ffd84d", ring: "#ff7a59" },
  FOREST: { label: "Forest", gradient: "linear-gradient(135deg,#2f7d32 0%,#6cb547 50%,#b9e07a 100%)", planet: "#ff7a59", ring: "#ffd84d" },
  NIGHT: { label: "Night", gradient: "linear-gradient(135deg,#0d2f33 0%,#1d5c5f 50%,#3a8f8c 100%)", planet: "#ffd84d", ring: "#ff7a59" },
  CORAL: { label: "Coral", gradient: "linear-gradient(135deg,#ff4f6d 0%,#ff7a59 50%,#ffc36b 100%)", planet: "#7b5cf0", ring: "#ffd84d" },
  SAND: { label: "Sand", gradient: "linear-gradient(135deg,#c98a3d 0%,#e6b267 50%,#f7dca4 100%)", planet: "#2ba3a0", ring: "#ff7a59" },
};

export const THEME_KEYS = Object.keys(THEMES) as Theme[];

export function themeStyle(theme: Theme) {
  return THEMES[theme] ?? THEMES.SUNSET;
}
