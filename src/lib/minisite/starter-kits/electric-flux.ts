import type { StarterKitDefinition } from "./types";

export const ELECTRIC_FLUX_KIT: StarterKitDefinition = {
  id: "electric-flux",
  tier: "free",
  label: "Electric Flux",
  tagline: "Neon · Urban · Zero friction",
  description:
    "Horizontale Rails, Bento-Info und Pill-Chips — komplett andere Seitenstruktur als Premium Atelier.",
  template: "flux",
  accentHex: "#00e5cc",
  content: {
    hero_headline: "{{shopName}}",
    about:
      "Kein Warten, kein Stress. Schnitt, Fade, Look — präzise, laut, clean. Dein Slot ist reserviert, bevor du die Tür aufmachst.",
    booking_notice: "Termin sichern · Bestätigung sofort · Walk-ins nach Kapazität",
    visitor_guidelines:
      "Pünktlichkeit zählt — 5 Min. vorher da.\nKarte & Bar vor Ort.\nAbsage bis 3 Std. vorher kostenlos.",
    show: {
      cover: true,
      about: true,
      prices: true,
      team: true,
      gallery: true,
      location: true,
      hours: true,
      social: true,
      guidelines: true,
    },
  },
};
