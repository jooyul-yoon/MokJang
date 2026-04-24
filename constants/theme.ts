/**
 * MokJang design tokens — consumed by non-NativeWind code (tab bar, navigation
 * theme, shadow style objects). The authoritative copies live in
 * `components/ui/gluestack-ui-provider/config.ts` (Tailwind + Gluestack) and
 * `DESIGN_SYSTEM.md` (documentation). Keep these in sync.
 */

import { Platform } from "react-native";

const PRIMARY = "#467CFA";
const PRIMARY_700 = "#2A5BD9";
const YELLOW = "#FFD109";

export const BrandColors = {
  primary: {
    50: "#F5F8FF",
    100: "#EBF2FF",
    200: "#D6E3FF",
    300: "#A9C7FA",
    400: "#6FA4F5",
    500: PRIMARY,
    600: "#3566E0",
    700: PRIMARY_700,
    800: "#1E44A8",
    900: "#14307A",
  },
  secondary: {
    100: "#FFF5B8",
    500: YELLOW,
    700: "#B89600",
  },
  fg: {
    1: "#182236",
    2: "#8A94A6",
    3: "#C4CAD4",
    disabled: "#E0E3E8",
  },
  bg: {
    0: "#FFFFFF",
    1: "#F7F8FA",
    2: "#F5F6F8",
    3: "#EEF0F4",
  },
  status: {
    success: "#4CAF50",
    warning: "#FFB020",
    error: "#FF5252",
    info: PRIMARY,
  },
  border: {
    subtle: "rgba(0, 0, 0, 0.06)",
    muted: "rgba(0, 0, 0, 0.10)",
  },
} as const;

export const BrandColorsDark = {
  fg: {
    1: "#ECEDEE",
    2: "#9BA1A6",
    3: "#6B7280",
  },
  bg: {
    0: "#151922",
    1: "#0B0F1A",
    2: "#1C2130",
    3: "#232939",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    muted: "rgba(255, 255, 255, 0.10)",
  },
} as const;

export const BrandShadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  navigation: {
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
} as const;

export const BrandRadii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  pill: 9999,
} as const;

export const BrandSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
} as const;

/**
 * Preserved shape for `useThemeColor` and other consumers that read
 * `Colors.light.tint` / `Colors.dark.background`.
 */
export const Colors = {
  light: {
    text: BrandColors.fg[1],
    background: BrandColors.bg[0],
    tint: PRIMARY,
    icon: BrandColors.fg[2],
    tabIconDefault: BrandColors.fg[3],
    tabIconSelected: PRIMARY,
  },
  dark: {
    text: BrandColorsDark.fg[1],
    background: BrandColorsDark.bg[0],
    tint: PRIMARY,
    icon: BrandColorsDark.fg[2],
    tabIconDefault: BrandColorsDark.fg[3],
    tabIconSelected: PRIMARY,
  },
};

const FONT_STACK_NATIVE =
  Platform.OS === "ios" ? "Pretendard" : "Pretendard-Variable";
const FONT_STACK_WEB =
  "Pretendard, 'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Noto Sans KR', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const Fonts = Platform.select({
  ios: {
    sans: FONT_STACK_NATIVE,
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: FONT_STACK_NATIVE,
    serif: "serif",
    rounded: FONT_STACK_NATIVE,
    mono: "monospace",
  },
  web: {
    sans: FONT_STACK_WEB,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: FONT_STACK_WEB,
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
