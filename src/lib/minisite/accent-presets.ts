function rgbHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

const PRESET_RGB = [
  { label: "Brass", rgb: [176, 141, 74] as const },
  { label: "Copper", rgb: [196, 92, 62] as const },
  { label: "Forest", rgb: [45, 106, 79] as const },
  { label: "Navy", rgb: [30, 58, 95] as const },
  { label: "Wine", rgb: [114, 47, 55] as const },
  { label: "Slate", rgb: [74, 85, 104] as const },
  { label: "Gold", rgb: [212, 160, 23] as const },
  { label: "Neon", rgb: [255, 255, 0] as const },
] as const;

export const MINISITE_ACCENT_PRESETS = PRESET_RGB.map((preset) => ({
  label: preset.label,
  hex: rgbHex(preset.rgb[0], preset.rgb[1], preset.rgb[2]),
}));
