import { Platform } from "react-native";

// Bumpr Design System Colors - Warm, Natural, Inviting
export const BumprColors = {
  // Primary: Warm coral-peach tone
  primary: "#E8785A",
  // Secondary: Fresh sage green
  secondary: "#7BB369",
  // Accent: Warm gold
  accent: "#F5B041",
  // Background: Warm cream
  background: "#FBF9F7",
  // Surface: Pure white
  surface: "#FFFFFF",
  // Text
  textPrimary: "#2D3436",
  textSecondary: "#7F8C8D",
  // Status colors
  statusOpen: "#7BB369",
  statusBusy: "#95A5A6",
  // System
  success: "#7BB369",
  warning: "#F5B041",
  error: "#E74C3C",
};

const tintColorLight = BumprColors.primary;
const tintColorDark = "#F09B8B";

export const Colors = {
  light: {
    text: BumprColors.textPrimary,
    textSecondary: BumprColors.textSecondary,
    buttonText: "#FFFFFF",
    tabIconDefault: BumprColors.textSecondary,
    tabIconSelected: tintColorLight,
    link: BumprColors.primary,
    primary: BumprColors.primary,
    secondary: BumprColors.secondary,
    accent: BumprColors.accent,
    backgroundRoot: BumprColors.background,
    backgroundDefault: BumprColors.surface,
    backgroundSecondary: "#F5F3F0",
    backgroundTertiary: "#EBE8E4",
    statusOpen: BumprColors.statusOpen,
    statusBusy: BumprColors.statusBusy,
    arOverlay: BumprColors.primary,
    success: BumprColors.success,
    warning: BumprColors.warning,
    error: BumprColors.error,
    border: "#E8E4E0",
    cardShadow: "rgba(0, 0, 0, 0.06)",
  },
  dark: {
    text: "#F5F5F5",
    textSecondary: "#A0A0A0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    primary: tintColorDark,
    secondary: "#8FC97A",
    accent: "#F7C16E",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#242424",
    backgroundSecondary: "#2E2E2E",
    backgroundTertiary: "#383838",
    statusOpen: "#8FC97A",
    statusBusy: "#6B7280",
    arOverlay: "#F09B8B",
    success: "#8FC97A",
    warning: "#F7C16E",
    error: "#EF6B5B",
    border: "#3A3A3A",
    cardShadow: "rgba(0, 0, 0, 0.25)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 48,
  buttonHeight: 52,
  fabSize: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  h4: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  caption: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  float: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Inter_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Inter_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
