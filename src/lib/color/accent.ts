import type { MinisiteTemplate } from "@/lib/validations/public-shop";

export type AccentPalette = {
  accent: string;
  accentHover: string;
  accentOnBg: string;
  onAccent: string;
};

const MIN_CONTRAST = 4.5;

const OKLCH_BLACK = "oklch(0 0 0)";
const OKLCH_WHITE = "oklch(1 0 0)";

const THEME_BACKGROUNDS: Record<MinisiteTemplate, string> = {
  classic: "oklch(0.95 0.02 85)",
  midnight: "oklch(0.16 0.008 75)",
  bold: "oklch(0.05 0 0)",
  signature: "oklch(0.11 0.018 68)",
  boutique: "oklch(0.96 0.018 85)",
  nicoles: "oklch(0.96 0.018 85)",
  flux: "oklch(0.13 0.035 265)",
};

type Rgb = { r: number; g: number; b: number };

export function parseHexColor(hex: string): Rgb {
  const normalized = hex.trim().toLowerCase();
  const match = /^#([0-9a-f]{6})$/.exec(normalized);
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const int = Number.parseInt(match[1]!, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function parseOklchColor(value: string): { l: number; c: number; h: number } {
  const match = /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid oklch color: ${value}`);
  }
  return {
    l: Number.parseFloat(match[1]!),
    c: Number.parseFloat(match[2]!),
    h: Number.parseFloat(match[3]!),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toByte = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return `#${[toByte(r), toByte(g), toByte(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgbToOklch({ r, g, b }: Rgb): { l: number; c: number; h: number } {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bLab * bLab);
  let H = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklchToHex(l: number, c: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const toSrgb = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    return clamped <= 0.0031308
      ? 12.92 * clamped * 255
      : (1.055 * clamped ** (1 / 2.4) - 0.055) * 255;
  };

  return rgbToHex({ r: toSrgb(lr), g: toSrgb(lg), b: toSrgb(lb) });
}

function colorToHex(color: string): string {
  if (color.startsWith("#")) {
    return rgbToHex(parseHexColor(color));
  }
  const { l, c, h } = parseOklchColor(color);
  return oklchToHex(l, c, h);
}

export function relativeLuminance(color: string): number {
  const { r, g, b } = parseHexColor(colorToHex(color));
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(a: string, b: string, t: number): string {
  const rgbA = parseHexColor(colorToHex(a));
  const rgbB = parseHexColor(colorToHex(b));
  return rgbToHex({
    r: rgbA.r + (rgbB.r - rgbA.r) * t,
    g: rgbA.g + (rgbB.g - rgbA.g) * t,
    b: rgbA.b + (rgbB.b - rgbA.b) * t,
  });
}

function adjustLightness(color: string, delta: number): string {
  const hex = colorToHex(color);
  const { l, c, h } = rgbToOklch(parseHexColor(hex));
  return oklchToHex(Math.min(1, Math.max(0, l + delta)), c, h);
}

function ensureContrastOnBackground(foreground: string, background: string): string {
  const fgHex = colorToHex(foreground);
  const bgHex = colorToHex(background);

  if (contrastRatio(fgHex, bgHex) >= MIN_CONTRAST) {
    return fgHex;
  }

  const fgLum = relativeLuminance(fgHex);
  const bgLum = relativeLuminance(bgHex);
  const toward = fgLum > bgLum ? OKLCH_WHITE : OKLCH_BLACK;

  for (let t = 0.05; t <= 1; t += 0.05) {
    const candidate = mixHex(fgHex, toward, t);
    if (contrastRatio(candidate, bgHex) >= MIN_CONTRAST) {
      return candidate;
    }
  }

  return colorToHex(toward);
}

function pickOnAccent(accent: string): string {
  const accentHex = colorToHex(accent);
  const black = contrastRatio(OKLCH_BLACK, accentHex);
  const white = contrastRatio(OKLCH_WHITE, accentHex);
  if (black >= MIN_CONTRAST && black >= white) return colorToHex(OKLCH_BLACK);
  if (white >= MIN_CONTRAST) return colorToHex(OKLCH_WHITE);
  return black >= white ? colorToHex(OKLCH_BLACK) : colorToHex(OKLCH_WHITE);
}

function ensureAccentFillContrast(accent: string, onAccent: string): string {
  const accentHex = colorToHex(accent);
  if (contrastRatio(onAccent, accentHex) >= MIN_CONTRAST) {
    return accentHex;
  }

  const { l, c, h } = rgbToOklch(parseHexColor(accentHex));
  const direction = onAccent === colorToHex(OKLCH_BLACK) ? -1 : 1;

  for (let step = 1; step <= 40; step += 1) {
    const next = oklchToHex(
      Math.min(1, Math.max(0, l + direction * step * 0.02)),
      c,
      h,
    );
    if (contrastRatio(onAccent, next) >= MIN_CONTRAST) {
      return next;
    }
  }

  return accentHex;
}

export function deriveAccentPalette(
  accentHex: string,
  template: MinisiteTemplate,
): AccentPalette {
  const background = THEME_BACKGROUNDS[template];
  const onAccent = pickOnAccent(accentHex);
  const accent = ensureAccentFillContrast(accentHex, onAccent);
  const accentOnBg = ensureContrastOnBackground(accentHex, background);
  const accentHover =
    relativeLuminance(accent) > relativeLuminance(background)
      ? adjustLightness(accent, -0.06)
      : adjustLightness(accent, 0.06);

  return { accent, accentHover, accentOnBg, onAccent };
}

export function accentPaletteToCssVars(palette: AccentPalette): Record<string, string> {
  return {
    "--ms-accent": palette.accent,
    "--ms-accent-hover": palette.accentHover,
    "--ms-accent-on-bg": palette.accentOnBg,
    "--ms-on-accent": palette.onAccent,
  };
}

export function deriveAccentCssVars(
  accentHex: string,
  template: MinisiteTemplate,
): Record<string, string> {
  return accentPaletteToCssVars(deriveAccentPalette(accentHex, template));
}
