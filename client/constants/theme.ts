import { Platform } from "react-native";

// Bumpr Design System Colors - Warm Cream Minimal Aesthetic
// Inspired by modern dating/social apps with soft, inviting tones
export const BumprColors = {
  // Primary: Warm terracotta/rust (for accents and highlights)
  primary: "#C4846C",
  // Secondary: Soft sage for positive states
  secondary: "#8FA67A",
  // Accent: Warm gold
  accent: "#D4A574",
  // Background: Warm cream/linen
  background: "#F5EDE4",
  // Surface: Lighter cream for cards
  surface: "#FAF7F3",
  // Text
  textPrimary: "#2C2825",
  textSecondary: "#7A756F",
  // Status colors
  statusOpen: "#8FA67A",
  statusBusy: "#9A958E",
  // System
  success: "#8FA67A",
  warning: "#D4A574",
  error: "#C97B7B",
};

const tintColorLight = BumprColors.primary;
const tintColorDark = "#D4A08A";

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
    backgroundSecondary: "#EFE8DF",
    backgroundTertiary: "#E8E0D6",
    statusOpen: BumprColors.statusOpen,
    statusBusy: BumprColors.statusBusy,
    arOverlay: BumprColors.primary,
    success: BumprColors.success,
    warning: BumprColors.warning,
    error: BumprColors.error,
    border: "#E5DED5",
    cardShadow: "rgba(44, 40, 37, 0.06)",
  },
  dark: {
    text: "#F5F2EF",
    textSecondary: "#A8A29D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A8A29D",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    primary: tintColorDark,
    secondary: "#9FB88A",
    accent: "#DEB68A",
    backgroundRoot: "#1C1A18",
    backgroundDefault: "#252320",
    backgroundSecondary: "#2F2C28",
    backgroundTertiary: "#3A3632",
    statusOpen: "#9FB88A",
    statusBusy: "#6E6A65",
    arOverlay: "#D4A08A",
    success: "#9FB88A",
    warning: "#DEB68A",
    error: "#D4908A",
    border: "#3D3935",
    cardShadow: "rgba(0, 0, 0, 0.3)",
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
