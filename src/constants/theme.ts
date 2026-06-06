import type { Band } from "../lib/engine";

export const COLORS = {
  background: "#0f172a",
  backgroundAlt: "#111c3a",
  surface: "rgba(255,255,255,0.05)",
  surface2: "rgba(255,255,255,0.08)",
  surface3: "rgba(255,255,255,0.12)",
  card: "rgba(255,255,255,0.08)",
  accent: "#f97316",
  accentDeep: "#ea580c",
  accentLight: "#fb923c",
  amber: "#fbbf24",
  white: "#ffffff",
  offWhite: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.7)",
  subtle: "rgba(255,255,255,0.4)",
  label: "rgba(255,255,255,0.55)",
  danger: "#ef4444",
  dangerSoft: "#f87171",
  warning: "#f59e0b",
  success: "#22c55e",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.15)",
} as const;

export const GRADIENTS = {
  main: ["#0f172a", "#1e3a8a", "#0f172a"],
  quiz: ["#0f172a", "#172554", "#0f172a"],
  cta: ["#f97316", "#ea580c"],
  headline: ["#f97316", "#fbbf24"],
  progress: ["#f97316", "#fbbf24"],
} as const;

export const BAND_COLORS: Record<Band, string> = {
  "AT RISK": "#B8341B",
  "SOMEWHAT PREPARED": "#D94A28",
  "PREPARED": "#C9A84C",
};

export const BAND_TONES: Record<Band, string> = {
  "AT RISK": "You are not alone — most people are here. Your 7-day plan opens with your weakest domain so the first win comes fast.",
  "SOMEWHAT PREPARED": "You have started. Your 7-day plan closes the biggest remaining gaps, one domain at a time.",
  "PREPARED": "You are in the top Band. Your 7-day plan sharpens the edges most people at your level still miss.",
};

export const DOMAIN_COLORS: Record<string, string> = {
  Digital: "#60a5fa",
  Legal: "#c084fc",
  Financial: "#34d399",
  Physical: "#fb923c",
};

export const FONTS = {
  sizes: {
    hero: 36,
    heading: 30,
    subheading: 18,
    body: 16,
    small: 14,
    tiny: 12,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 28,
    "3xl": 36,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  families: {
    display: "Sora_700Bold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemibold: "Inter_600SemiBold",
    bodyBold: "Inter_700Bold",
  },
} as const;

export const RADIUS = {
  card: 14,
  pill: 100,
  input: 12,
  surface: 24,
} as const;

export const SHADOWS = {
  cta: {
    boxShadow: "0px 8px 32px rgba(249,115,22,0.4), 0px 2px 8px rgba(0,0,0,0.3)",
    elevation: 10,
  },
  ctaHover: {
    boxShadow: "0px 14px 40px rgba(249,115,22,0.5), 0px 4px 12px rgba(0,0,0,0.3)",
    elevation: 12,
  },
  card: {
    boxShadow: "0px 4px 16px rgba(0,0,0,0.35)",
    elevation: 6,
  },
} as const;

export const LAYOUT = {
  pageWidth: 1100,
  contentWidth: 700,
  quizCardWidth: 660,
  captureCardWidth: 500,
} as const;

export const MOTION = {
  standardIn: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  exit: "cubic-bezier(0.55, 0, 1, 0.45)",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;
