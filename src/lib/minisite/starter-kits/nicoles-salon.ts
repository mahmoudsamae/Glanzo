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
import { DEFAULT_NICOLES_NEWS, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";

export const NICOLES_SALON_KIT: StarterKitDefinition = {
  id: "nicoles-salon",
  tier: "free",
  label: "Nicoles Salon",
  tagline: "Teal & Gold · 8 Homepage-Abschnitte",
  description:
    "Premium Salon-Homepage: Hero, Über uns, Salon-Banner, Leistungen, Aktionstage, Team, News und Pre-Footer.",
  template: "nicoles",
  accentHex: "#B8923A",
  content: {
    hero_headline: "Lebensgefühl bis in die Spitzen.",
    about:
      "Ob klassischer Haarschnitt, moderner Style oder individuelle Beratung — bei uns bist du in besten Händen. Für Damen, Herren und Kinder.",
    booking_notice: "Jetzt online buchen — Bestätigung in Sekunden. Walk-ins nach Verfügbarkeit.",
    address: DEFAULT_KONTAKT_ADDRESS,
    phone: DEFAULT_KONTAKT_PHONE,
    email: DEFAULT_KONTAKT_EMAIL,
    instagram: "@nicoles_friseur_barber",
    links: {
      whatsapp: "+49 941 38228885",
      instagram: "@nicoles_friseur_barber",
    },
    nav_links: defaultNavLinksForTemplate("nicoles"),
    about_blocks: defaultNicolesAboutBlocks({ about: "Ob klassischer Haarschnitt, moderner Style oder individuelle Beratung — bei uns bist du in besten Händen. Für Damen, Herren und Kinder." }),
    nicoles_service_cards: DEFAULT_NICOLES_SERVICE_CARDS,
    nicoles_price_sections: DEFAULT_NICOLES_PRICE_SECTIONS,
    nicoles_news: DEFAULT_NICOLES_NEWS,
    section_order: [
      "hero",
      "about",
      "salon_banner",
      "services",
      "aktionstage",
      "team",
      "news",
      "pre_footer",
    ],
    sections: {
      nav: { text: "friseur- & barbershop" },
      hero: { ...NICOLES_SECTION_META.hero.defaults },
      about: { ...NICOLES_SECTION_META.about.defaults },
      salon_banner: { ...NICOLES_SECTION_META.salon_banner.defaults },
      services: { ...NICOLES_SECTION_META.services.defaults },
      aktionstage: { ...NICOLES_SECTION_META.aktionstage.defaults },
      team: { ...NICOLES_SECTION_META.team.defaults },
      news: { ...NICOLES_SECTION_META.news.defaults },
      prices: { title: "Leistungen & Preise" },
      booking: { title: "Terminbuchung", text: DEFAULT_NICOLES_BOOKING_INTRO },
      contact: {
        title: "Kontakt",
        subtitle: "Dienstag bis Freitag: 09–19 Uhr\nSamstag: 10–18 Uhr",
        text: DEFAULT_KONTAKT_MAP_DIRECTIONS,
      },
    },
    show: {
      cover: true,
      about: true,
      salon_banner: true,
      prices: true,
      team: true,
      aktionstage: true,
      news: true,
      pre_footer: true,
      gallery: true,
      location: true,
      hours: true,
      social: true,
      guidelines: false,
    },
  },
};
