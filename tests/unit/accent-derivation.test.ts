import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  deriveAccentPalette,
  relativeLuminance,
} from "@/lib/color/accent";

const MIN_AA = 4.5;

describe("deriveAccentPalette", () => {
  const cases = [
    { name: "neon yellow", hex: "#ffff00", template: "midnight" as const },
    { name: "neon green", hex: "#39ff14", template: "midnight" as const },
    { name: "near black", hex: "#111111", template: "classic" as const },
    { name: "near white", hex: "#f8f8f8", template: "bold" as const },
    { name: "mid gray", hex: "#888888", template: "classic" as const },
    { name: "default brass", hex: "#b08d4a", template: "midnight" as const },
    { name: "pure red", hex: "#ff0000", template: "classic" as const },
    { name: "blue", hex: "#0066cc", template: "midnight" as const },
    { name: "purple", hex: "#9333ea", template: "bold" as const },
    { name: "orange", hex: "#ff8800", template: "classic" as const },
    { name: "cyan", hex: "#00cccc", template: "midnight" as const },
  ];

  it.each(cases)("passes AA for on-accent text ($name)", ({ hex, template }) => {
    const palette = deriveAccentPalette(hex, template);
    expect(contrastRatio(palette.onAccent, palette.accent)).toBeGreaterThanOrEqual(MIN_AA);
  });

  it.each(cases)("passes AA for accent-on-bg text ($name)", ({ hex, template }) => {
    const palette = deriveAccentPalette(hex, template);
    const backgrounds = {
      classic: "oklch(0.95 0.02 85)",
      midnight: "oklch(0.16 0.008 75)",
      bold: "oklch(0.05 0 0)",
      signature: "oklch(0.11 0.018 68)",
      boutique: "oklch(0.96 0.018 85)",
      nicoles: "oklch(0.96 0.018 85)",
      flux: "oklch(0.13 0.035 265)",
    };
    expect(contrastRatio(palette.accentOnBg, backgrounds[template])).toBeGreaterThanOrEqual(
      MIN_AA,
    );
  });

  it("neon yellow keeps a sane dark on-accent", () => {
    const palette = deriveAccentPalette("#ffff00", "midnight");
    expect(palette.onAccent.toLowerCase()).toBe("#000000");
    expect(relativeLuminance(palette.accent)).toBeLessThan(0.95);
  });

  it("hover differs from base accent", () => {
    const palette = deriveAccentPalette("#b08d4a", "midnight");
    expect(palette.accentHover).not.toBe(palette.accent);
  });
});
