/** Velvet Atelier — per-shop locale strings (DE / EN). */

export type VelvetLocale = "en" | "de";

export const VELVET_DEFAULT_LOCALE: VelvetLocale = "de";

export type VelvetI18n = {
  nav: {
    bookNow: string;
    menuOpen: string;
    menuClose: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    bookNow: string;
    ourWork: string;
  };
  about: {
    eyebrow: string;
    title: string;
    text: string;
    ctaLabel: string;
    statLabels: { years: string; sets: string; rated: string };
    glassTag: string;
  };
  services: {
    eyebrow: string;
    title: string;
    collectionTitle: string;
    featureText: string;
    ctaLabel: string;
    from: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    captions: [string, string, string, string, string, string];
  };
  social: {
    subtitle: string;
    ctaLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    address: string;
    phone: string;
    email: string;
    hoursTitle: string;
    closed: string;
    introText: string;
    weekdays: Record<string, string>;
  };
  booking: {
    label: string;
    title: string;
    titleEm: string;
    notice: string;
    cta: string;
    hint: string;
  };
  footer: {
    tagline: string;
    navHeading: string;
    links: { home: string; about: string; services: string; gallery: string; contact: string };
    contactHeading: string;
    rights: string;
  };
};

const EN: VelvetI18n = {
  nav: { bookNow: "Book Now", menuOpen: "Open menu", menuClose: "Close menu" },
  hero: {
    eyebrow: "NAIL ATELIER",
    title: "Nails as Art.",
    body: "Handcrafted nail art. Every set is a collaboration between artist and client.",
    bookNow: "Book Now",
    ourWork: "Our Work ↓",
  },
  about: {
    eyebrow: "THE ARTIST",
    title: "Crafted with intention.",
    text: "Every set is handcrafted — a collaboration between artist and client, shaped by your vision and finished with precision.",
    ctaLabel: "Meet the Artist →",
    statLabels: { years: "Years", sets: "Sets", rated: "Rated" },
    glassTag: "Handcrafted Quality",
  },
  services: {
    eyebrow: "THE MENU",
    title: "Curated Services.",
    collectionTitle: "The Collection",
    featureText: "Precision, artistry, and care — in every appointment.",
    ctaLabel: "View Full Menu →",
    from: "from",
  },
  gallery: {
    eyebrow: "THE WORK",
    title: "Every nail, a canvas.",
    captions: ["The Statement Set", "Minimalist Edit", "Floral Art", "Chrome Dreams", "French Elevated", "Pearl Finish"],
  },
  social: { subtitle: "Follow our work", ctaLabel: "Follow on Instagram →" },
  contact: {
    eyebrow: "VISIT US",
    title: "Find your way.",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hoursTitle: "Opening Hours",
    closed: "Closed",
    introText: "We are open and ready to craft your next favorite set.",
    weekdays: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
  },
  booking: {
    label: "Ready to book?",
    title: "Book your",
    titleEm: "perfect set.",
    notice: "Book online — confirmation within seconds.",
    cta: "Book Now",
    hint: "by appointment · online booking available 24/7",
  },
  footer: {
    tagline: "Handcrafted nail art. Every set is a work of art.",
    navHeading: "Navigation",
    links: { home: "Home", about: "About", services: "Services", gallery: "Gallery", contact: "Contact" },
    contactHeading: "Contact",
    rights: "All rights reserved.",
  },
};

const DE: VelvetI18n = {
  nav: { bookNow: "Jetzt buchen", menuOpen: "Menü öffnen", menuClose: "Menü schließen" },
  hero: {
    eyebrow: "NAGEL ATELIER",
    title: "Nägel als Kunst.",
    body: "Handgefertigte Nagelkunst. Jedes Set ist eine Zusammenarbeit zwischen Künstlerin und Kundin.",
    bookNow: "Jetzt buchen",
    ourWork: "Unsere Arbeit ↓",
  },
  about: {
    eyebrow: "DIE KÜNSTLERIN",
    title: "Mit Leidenschaft gemacht.",
    text: "Jedes Set wird handgefertigt — eine Zusammenarbeit zwischen Künstlerin und Kundin, geformt durch Ihre Vision und mit Präzision vollendet.",
    ctaLabel: "Die Künstlerin kennenlernen →",
    statLabels: { years: "Jahre", sets: "Sets", rated: "Bewertet" },
    glassTag: "Handgemachte Qualität",
  },
  services: {
    eyebrow: "DAS MENÜ",
    title: "Kuratierte Leistungen.",
    collectionTitle: "Die Kollektion",
    featureText: "Präzision, Kunstfertigkeit und Sorgfalt — bei jedem Termin.",
    ctaLabel: "Vollständiges Menü ansehen →",
    from: "ab",
  },
  gallery: {
    eyebrow: "DIE ARBEIT",
    title: "Jeder Nagel, eine Leinwand.",
    captions: ["Das Statement Set", "Minimalistisch", "Blumenkunst", "Chromträume", "Erhabenes French", "Perlenfinish"],
  },
  social: { subtitle: "Folge unserer Arbeit", ctaLabel: "Auf Instagram folgen →" },
  contact: {
    eyebrow: "BESUCHT UNS",
    title: "Finde uns.",
    address: "Adresse",
    phone: "Telefon",
    email: "E-Mail",
    hoursTitle: "Öffnungszeiten",
    closed: "Geschlossen",
    introText: "Wir sind geöffnet und bereit, dein nächstes Lieblingsset zu kreieren.",
    weekdays: { mon: "Montag", tue: "Dienstag", wed: "Mittwoch", thu: "Donnerstag", fri: "Freitag", sat: "Samstag", sun: "Sonntag" },
  },
  booking: {
    label: "Bereit zum Buchen?",
    title: "Buche dein",
    titleEm: "perfektes Set.",
    notice: "Online buchen — Bestätigung in Sekunden.",
    cta: "Jetzt buchen",
    hint: "nach Vereinbarung · Online-Buchung 24/7 verfügbar",
  },
  footer: {
    tagline: "Handgefertigte Nagelkunst. Jedes Set ist ein Kunstwerk.",
    navHeading: "Navigation",
    links: { home: "Startseite", about: "Über uns", services: "Leistungen", gallery: "Galerie", contact: "Kontakt" },
    contactHeading: "Kontakt",
    rights: "Alle Rechte vorbehalten.",
  },
};

export const VELVET_I18N: Record<VelvetLocale, VelvetI18n> = { en: EN, de: DE };

export function getVelvetI18n(locale?: string | null): VelvetI18n {
  if (locale === "en" || locale === "de") return VELVET_I18N[locale];
  return VELVET_I18N[VELVET_DEFAULT_LOCALE];
}

export const VELVET_LOCALE_LABELS: Record<VelvetLocale, string> = {
  en: "English",
  de: "Deutsch",
};
