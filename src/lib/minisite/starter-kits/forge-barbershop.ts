import type { StarterKitDefinition } from "./types";
import { defaultNicolesAboutBlocks } from "@/lib/minisite/nicoles-about-blocks";
import {
  DEFAULT_NICOLES_PRICE_SECTIONS,
  DEFAULT_NICOLES_SERVICE_CARDS,
} from "@/lib/minisite/nicoles-prices-page";
import { DEFAULT_NICOLES_BOOKING_INTRO } from "@/lib/minisite/nicoles-terminbuchung-page";
import {
  DEFAULT_KONTAKT_ADDRESS,
  DEFAULT_KONTAKT_EMAIL,
  DEFAULT_KONTAKT_MAP_DIRECTIONS,
  DEFAULT_KONTAKT_PHONE,
} from "@/lib/minisite/nicoles-kontakt-page";
import { defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";
import { FORGE_SECTION_META } from "@/lib/minisite/forge-sections";

const FORGE_ABOUT =
  "Fade, Beard Trim, Hot Towel — präzise Schnitte und ein Look, der sitzt. Kein Schnickschnack, nur Handwerk und Atmosphäre.";

export const FORGE_BARBERSHOP_KIT: StarterKitDefinition = {
  id: "forge-barbershop",
  tier: "free",
  label: "Forge Barbershop",
  tagline: "Schwer · Kupfer · Syne",
  description:
    "Flagship Barbershop-Website: dunkler Hero, Leistungen, Team, Aktionen und Buchung — mit Premium-Scroll-Animationen.",
  template: "forge",
  accentHex: "#C47A2C",
  content: {
    hero_headline: "Cut. Style. Attitude.",
    about: FORGE_ABOUT,
    booking_notice: "Online buchen — Bestätigung in Sekunden.",
    address: DEFAULT_KONTAKT_ADDRESS,
    phone: DEFAULT_KONTAKT_PHONE,
    email: DEFAULT_KONTAKT_EMAIL,
    instagram: "@forge_barbershop",
    links: {
      whatsapp: "+49 170 0000000",
      instagram: "@forge_barbershop",
    },
    nav_links: defaultNavLinksForTemplate("forge"),
    about_blocks: defaultNicolesAboutBlocks({ about: FORGE_ABOUT }),
    nicoles_service_cards: DEFAULT_NICOLES_SERVICE_CARDS,
    nicoles_price_sections: DEFAULT_NICOLES_PRICE_SECTIONS.filter((section) =>
      ["price-kinder", "price-teenie"].includes(section.id),
    ),
    nicoles_news: [],
    section_order: [
      "hero",
      "about",
      "salon_banner",
      "services",
      "aktionstage",
      "news",
      "pre_footer",
    ],
    sections: {
      nav: { text: "barbershop" },
      hero: {
        ...FORGE_SECTION_META.hero.defaults,
        title: "Cut. Style. Attitude.",
        badge_tiny: "NEU",
        badge_medium: "JEDEN DONNERSTAG",
        badge_large: "STUDENTEN DEAL",
      },
      about: {
        ...FORGE_SECTION_META.about.defaults,
        eyebrow: "DER BARBERSHOP",
        title: "Handwerk trifft Atmosphäre.",
        text: FORGE_ABOUT,
        cta_label: "MEHR ÜBER UNS",
      },
      salon_banner: {
        ...FORGE_SECTION_META.salon_banner.defaults,
        title: "Rein. Setz dich. Lass uns arbeiten.",
      },
      services: {
        ...FORGE_SECTION_META.services.defaults,
        eyebrow: "LEISTUNGEN",
        title: "Fade. Beard. Razor. — alles aus einer Hand.",
        text: "Klare Preise, klare Cuts. Walk-ins willkommen, wenn ein Stuhl frei ist.",
        cta_label: "ALLE LEISTUNGEN",
      },
      aktionstage: { ...FORGE_SECTION_META.aktionstage.defaults },
      pre_footer: { ...FORGE_SECTION_META.pre_footer.defaults },
      prices: { title: "Leistungen & Preise" },
      booking: { title: "Terminbuchung", text: DEFAULT_NICOLES_BOOKING_INTRO },
      contact: {
        title: "Kontakt",
        subtitle: "Di–Fr: 10–20 Uhr\nSa: 09–18 Uhr",
        text: DEFAULT_KONTAKT_MAP_DIRECTIONS,
      },
    },
    show: {
      cover: true,
      about: true,
      salon_banner: true,
      prices: true,
      team: false,
      aktionstage: true,
      news: false,
      pre_footer: true,
      gallery: true,
      location: true,
      hours: true,
      social: true,
      guidelines: true,
    },
  },
};
