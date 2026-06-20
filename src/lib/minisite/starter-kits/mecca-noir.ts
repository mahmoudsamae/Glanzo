import type { StarterKitDefinition } from "./types";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import { defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";

export const MECCA_NOIR_KIT: StarterKitDefinition = {
  id: "mecca-noir",
  tier: "free",
  label: "Mecca Noir",
  tagline: "Dark luxury · Champagne gold",
  description:
    "Premium Dark-Salon-Homepage: Fullscreen-Hero, Über uns, Leistungen, Galerie, Bewertungen und Kontakt.",
  template: "mecca",
  accentHex: "#C9A84C",
  content: {
    hero_headline: "Erlebe deinen besten Look.",
    about:
      "Wir setzen Maßstäbe in Handwerk, Beratung und Atmosphäre — für Looks, die zu dir passen.",
    booking_notice: "Jetzt online buchen — Bestätigung in Sekunden.",
    address: "Musterstraße 12, 80331 München",
    phone: "+49 89 1234567",
    email: "hello@salon-mecca.de",
    instagram: "@mecca_salon",
    links: {
      whatsapp: "+49 89 1234567",
      instagram: "@mecca_salon",
    },
    nav_links: defaultNavLinksForTemplate("nicoles"),
    sections: {
      nav: { text: "Premium Hair Salon" },
      hero: { ...MECCA_SECTION_META.hero.defaults },
      about: {
        ...MECCA_SECTION_META.about.defaults,
        cta_label: "Mehr über uns →",
        badge_tiny: "10+ Jahre Erfahrung",
        badge_medium: "500+ Kunden",
        badge_large: "5★ Bewertungen",
      },
      services: { ...MECCA_SECTION_META.services.defaults, cta_label: "Alle Leistungen →" },
      gallery: { ...MECCA_SECTION_META.gallery.defaults },
      contact: { ...MECCA_SECTION_META.contact.defaults },
    },
    show: {
      cover: true,
      about: true,
      prices: true,
      gallery: true,
      location: true,
      hours: true,
      social: true,
      guidelines: false,
    },
  },
};
