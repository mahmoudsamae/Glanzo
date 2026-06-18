import type { StarterKitDefinition } from "./types";
import { DEFAULT_NAV_LINKS, defaultAboutBlocks } from "@/lib/minisite/about-blocks";

export const PREMIUM_ATELIER_KIT: StarterKitDefinition = {
  id: "premium-atelier",
  tier: "free",
  label: "Premium Boutique",
  tagline: "Mobile-first · Navbar · Galerie",
  description:
    "Salon-Website wie eine Boutique: Navbar, Hero, Service-Kacheln, Collage, Galerie und Footer.",
  template: "boutique",
  accentHex: "#b5965a",
  content: {
    hero_headline: "{{shopName}}",
    about:
      "Wir nehmen uns Zeit für dich. Mit ehrlicher Beratung, starken Ergebnissen und einem Lächeln, das bleibt — für Damen, Herren und Kinder.",
    booking_notice: "Jetzt online buchen — Bestätigung in Sekunden. Walk-ins nach Verfügbarkeit.",
    visitor_guidelines:
      "Bitte 5 Minuten vor Termin da sein.\nBarzahlung & Karte willkommen.\nStornierung bis 2 Stunden vorher kostenfrei.",
    nav_links: DEFAULT_NAV_LINKS,
    about_blocks: defaultAboutBlocks({
      about:
        "Wir nehmen uns Zeit für dich. Mit ehrlicher Beratung, starken Ergebnissen und einem Lächeln, das bleibt — für Damen, Herren und Kinder.",
    }),
    section_order: ["hero", "services", "about", "promo", "prices", "gallery", "team", "guidelines", "visit"],
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
