import type { StarterKitDefinition } from "./types";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import { defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";

export const VELVET_ATELIER_KIT: StarterKitDefinition = {
  id: "velvet-atelier",
  tier: "free",
  label: "Velvet Atelier",
  tagline: "Ivory · Blush · Rose Gold",
  description:
    "Premium Nail Salon Template: Cinematic Hero, Künstlerprofil, Leistungsmenü, Art-Exhibition-Galerie und Buchungs-CTA.",
  template: "velvet",
  accentHex: "#B87868",
  content: {
    hero_headline: "Nails as Art.",
    about:
      "Every set is handcrafted — a collaboration between artist and client, shaped by your vision and finished with precision.",
    booking_notice: "Book online — confirmation within seconds.",
    address: "Musterstraße 12, 80331 München",
    phone: "+49 89 1234567",
    email: "hello@velvet-atelier.de",
    instagram: "@velvet.atelier",
    links: {
      whatsapp: "+49 89 1234567",
      instagram: "@velvet.atelier",
    },
    nav_links: defaultNavLinksForTemplate("velvet"),
    sections: {
      nav: { text: "Premium Nail Atelier" },
      hero: {
        ...VELVET_SECTION_META.hero.defaults,
        title: "Nails | as | Art.",
        eyebrow: "NAIL ATELIER",
        text: "Handcrafted nail art. Every set is a collaboration between artist and client.",
        cta_label: "Book Your Set",
      },
      about: {
        ...VELVET_SECTION_META.about.defaults,
        title: "Crafted with intention.",
        eyebrow: "THE ARTIST",
        badge_tiny: "5+ Years",
        badge_medium: "1000+ Sets",
        badge_large: "5★ Rated",
        cta_label: "Meet the Artist →",
      },
      services: {
        ...VELVET_SECTION_META.services.defaults,
        eyebrow: "THE MENU",
        title: "Curated Services.",
        cta_label: "View Full Menu →",
      },
      gallery: {
        ...VELVET_SECTION_META.gallery.defaults,
        eyebrow: "THE WORK",
        title: "Every nail, a canvas.",
      },
      contact: {
        ...VELVET_SECTION_META.contact.defaults,
        eyebrow: "VISIT US",
        title: "Find your way.",
      },
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
