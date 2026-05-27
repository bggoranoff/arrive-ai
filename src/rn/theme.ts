export type ThemeMode = "light" | "dark";

const lightColors = {
  brand: "#185fa5",
  brandSoft: "#e6eef7",
  deadlineBg: "#faeeda",
  deadlineText: "#854f0b",
  deadlineDot: "#ef9f27",
  ink: "#0f172a",
  inkMuted: "#6b7280",
  surface: "#ffffff",
  screenBg: "#f5f6f8",
  cardBorder: "#e6e8ec",
  newBadgeBg: "#e8f3ec",
  newBadgeText: "#1f7a3a",
};

const darkColors: typeof lightColors = {
  brand: "#4d9de6",
  brandSoft: "#1a2a3d",
  deadlineBg: "#3d2e10",
  deadlineText: "#f0c060",
  deadlineDot: "#ef9f27",
  ink: "#e8eaed",
  inkMuted: "#9ca3af",
  surface: "#1e2028",
  screenBg: "#121318",
  cardBorder: "#2e3038",
  newBadgeBg: "#1a2e20",
  newBadgeText: "#4eda6a",
};

export function getColors(mode: ThemeMode) {
  return mode === "dark" ? darkColors : lightColors;
}

// Default export for backwards compatibility during transition
export const colors = lightColors;

export const fonts = {
  regular: { fontWeight: "400" as const },
  medium: { fontWeight: "500" as const },
  semibold: { fontWeight: "600" as const },
  bold: { fontWeight: "700" as const },
};
