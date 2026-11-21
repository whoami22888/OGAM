
"use strict";

const FONTS = {
  sans: "System",
  mono: "monospace",
};

const type = (fontSize, lineHeight, fontWeight = "400") => ({
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily: FONTS.sans,
});

const TYPOGRAPHY = {
  display: type(34, 40, "700"),
  h1: type(28, 34, "700"),
  h2: type(22, 28, "600"),
  h3: type(18, 24, "600"),
  body: type(16, 22, "400"),
  bodySmall: type(14, 20, "400"),
  label: type(13, 18, "600"),
  labelSmall: type(11, 16, "600"),
  meta: type(12, 16, "400"),
  metaSmall: type(10, 14, "400"),
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

const LIVING_FIELD = {
  dotAlphaDark: 0.18,
  dotAlphaLight: 0.12,
  breathMs: 4200,
};

const ALIVE = {
  ringReach: 18,
  trailMs: 420,
  scrollDrift: 0.4,
  litAlphaDark: 0.35,
  litAlphaLight: 0.22,
  lightInMs: 280,
  waveSpeed: 1,
  holdAfterCancelMs: 160,
};

const COLORS_LIGHT = {
  text: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  primary: "#059669",
  primaryDark: "#047857",
  onPrimary: "#FFFFFF",
  background: "#F7F7F5",
  surface: "#FFFFFF",
  surfaceLight: "#F3F4F6",
  surfaceGlass: "rgba(255,255,255,0.72)",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  error: "#DC2626",
  errorBackground: "#FEE2E2",
  warning: "#D97706",
  info: "#2563EB",
  success: "#059669",
  onHero: "#FFFFFF",
  heroBorder: "rgba(5,150,105,0.35)",
  heroFill: "#059669",
  selectedFill: "rgba(5,150,105,0.12)",
  trending: "#7C3AED",
  overlay: "rgba(0,0,0,0.45)",
};

const COLORS_DARK = {
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textMuted: "#9CA3AF",
  primary: "#34D399",
  primaryDark: "#059669",
  onPrimary: "#042F2E",
  background: "#0B0F0E",
  surface: "#151A19",
  surfaceLight: "#1C2321",
  surfaceGlass: "rgba(21,26,25,0.72)",
  border: "#2A3330",
  borderLight: "#1F2624",
  error: "#F87171",
  errorBackground: "rgba(248,113,113,0.16)",
  warning: "#FBBF24",
  info: "#60A5FA",
  success: "#34D399",
  onHero: "#042F2E",
  heroBorder: "rgba(52,211,153,0.35)",
  heroFill: "#065F46",
  selectedFill: "rgba(52,211,153,0.16)",
  trending: "#C4B5FD",
  overlay: "rgba(0,0,0,0.6)",
};

module.exports = {
  FONTS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  LIVING_FIELD,
  ALIVE,
  COLORS_LIGHT,
  COLORS_DARK,
};
