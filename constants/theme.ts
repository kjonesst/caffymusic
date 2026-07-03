import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#C8965B",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#C8965B",
  },
  dark: {
    text: "#F5F0EC",
    background: "#0D0B0E",
    tint: "#C8965B",
    icon: "#9E9589",
    tabIconDefault: "#5C5650",
    tabIconSelected: "#C8965B",
  },
};

export const MC = {
  bg: "#0D0B0E",
  surface: "#1A1720",
  surfaceElevated: "#24202E",
  accent: "#C8965B",
  accentLight: "#E8B47A",
  paleYellow: "#F0E6A8",
  textPrimary: "#F5F0EC",
  textSecondary: "#9E9589",
  textMuted: "#5C5650",
  border: "#2A2535",
  brownSurface: "#3A2F2B",
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
