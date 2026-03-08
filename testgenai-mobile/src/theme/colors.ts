export const colors = {
  light: {
    background: "#FFFFFF",
    card: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    primary: "#6366F1",
    primaryForeground: "#FFFFFF",
    success: "#10B981",
    destructive: "#EF4444",
    orange: "#F97316",
    orangeLight: "#FFF7ED",
    muted: "#F3F4F6",
  },
  dark: {
    background: "#0F172A",
    card: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    border: "#334155",
    primary: "#818CF8",
    primaryForeground: "#FFFFFF",
    success: "#34D399",
    destructive: "#F87171",
    orange: "#FB923C",
    orangeLight: "#1C1917",
    muted: "#1E293B",
  },
};

export type ThemeColors = typeof colors.light;
