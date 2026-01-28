import { Platform } from "react-native";

// Bumpr Design System Colors
export const BumprColors = {
  primary: "#5B7C99",
  secondary: "#7A9D54",
  background: "#FAFBFC",
  surface: "#FFFFFF",
  textPrimary: "#1A2332",
  textSecondary: "#6B7684",
  statusOpen: "#7A9D54",
  statusBusy: "#8E93A1",
  arOverlay: "#5B7C99",
  success: "#7A9D54",
  warning: "#E8A758",
  error: "#D85D5D",
};

const tintColorLight = BumprColors.primary;
const tintColorDark = "#7A9DBB";

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
    backgroundRoot: BumprColors.background,
    backgroundDefault: BumprColors.surface,
    backgroundSecondary: "#F0F2F5",
    backgroundTertiary: "#E8EAED",
    statusOpen: BumprColors.statusOpen,
    statusBusy: BumprColors.statusBusy,
    arOverlay: BumprColors.arOverlay,
    success: BumprColors.success,
    warning: BumprColors.warning,
    error: BumprColors.error,
    border: "#E5E7EB",
    cardShadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    primary: tintColorDark,
    secondary: "#8FB366",
    backgroundRoot: "#0F1115",
    backgroundDefault: "#1A1D24",
    backgroundSecondary: "#252930",
    backgroundTertiary: "#31363F",
    statusOpen: "#8FB366",
    statusBusy: "#6B7280",
    arOverlay: "#7A9DBB",
    success: "#8FB366",
    warning: "#F0B864",
    error: "#E06B6B",
    border: "#31363F",
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
    shadowOpacity: 0.08,
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
    shadowOpacity: 0.12,
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
