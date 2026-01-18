import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2C1810",
    textSecondary: "#6B5D54",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B5D54",
    tabIconSelected: "#6B4423",
    link: "#6B4423",
    backgroundRoot: "#F8F5F0",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#EDE6DD",
    backgroundTertiary: "#E5DED5",
    primary: "#6B4423",
    secondary: "#A67C52",
    success: "#4A7C59",
    error: "#C1440E",
    border: "#D4C9BE",
  },
  dark: {
    text: "#F5F0EB",
    textSecondary: "#A99F96",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8B8178",
    tabIconSelected: "#D4A574",
    link: "#D4A574",
    backgroundRoot: "#1A1412",
    backgroundDefault: "#252019",
    backgroundSecondary: "#302820",
    backgroundTertiary: "#3D332A",
    primary: "#D4A574",
    secondary: "#A67C52",
    success: "#6B9B7A",
    error: "#E07050",
    border: "#4A3F35",
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
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
