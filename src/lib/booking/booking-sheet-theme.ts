import type { CSSProperties } from "react";

import { deriveAccentCssVars } from "@/lib/color/accent";
import type { MinisiteTemplate } from "@/lib/validations/public-shop";

type BookingSurface = {
  bg: string;
  elevated: string;
  text: string;
  textMuted: string;
  border: string;
  overlay: string;
};

/** Solid surfaces for the booking portal (rendered outside `.minisite`). */
const BOOKING_SURFACES: Record<MinisiteTemplate, BookingSurface> = {
  classic: {
    bg: "#f5f0e8",
    elevated: "#faf7f2",
    text: "#2a241c",
    textMuted: "#6b6358",
    border: "#ddd5cb",
    overlay: "rgb(42 36 28 / 0.88)",
  },
  midnight: {
    bg: "#1a1814",
    elevated: "#242019",
    text: "#f5f0eb",
    textMuted: "#a8a095",
    border: "#3d3830",
    overlay: "rgb(8 7 6 / 0.92)",
  },
  bold: {
    bg: "#0a0a0a",
    elevated: "#141414",
    text: "#fafafa",
    textMuted: "#9ca3af",
    border: "#2a2a2a",
    overlay: "rgb(0 0 0 / 0.94)",
  },
  signature: {
    bg: "#14110e",
    elevated: "#1c1814",
    text: "#f7f2ea",
    textMuted: "#a89f92",
    border: "#3a342c",
    overlay: "rgb(10 8 6 / 0.92)",
  },
  boutique: {
    bg: "#162c2c",
    elevated: "#1e3a3a",
    text: "#f5f0eb",
    textMuted: "#b8b0a6",
    border: "color-mix(in oklch, #b8923a 28%, #2a4545)",
    overlay: "rgb(12 24 24 / 0.92)",
  },
  nicoles: {
    bg: "#162c2c",
    elevated: "#1e3a3a",
    text: "#f5f0eb",
    textMuted: "#c4bdb4",
    border: "color-mix(in oklch, #b8923a 30%, #243838)",
    overlay: "rgb(8 18 18 / 0.94)",
  },
  flux: {
    bg: "#12131f",
    elevated: "#1a1b2e",
    text: "#f0f4ff",
    textMuted: "#9aa3c2",
    border: "#2e3150",
    overlay: "rgb(8 10 20 / 0.93)",
  },
};

export function bookingSheetCssVars(
  template: MinisiteTemplate,
  accentHex: string,
): CSSProperties {
  const surface = BOOKING_SURFACES[template];

  return {
    ...deriveAccentCssVars(accentHex, template),
    "--ms-bg": surface.bg,
    "--ms-bg-elevated": surface.elevated,
    "--ms-text": surface.text,
    "--ms-text-muted": surface.textMuted,
    "--ms-border-subtle": surface.border,
    "--ms-booking-overlay": surface.overlay,
  } as CSSProperties;
}

export function bookingSheetThemeClass(template: MinisiteTemplate): string {
  return `theme-${template}`;
}
