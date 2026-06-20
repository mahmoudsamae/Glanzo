import type { MinisiteContent } from "@/lib/validations/public-shop";

export const MECCA_HOME_SECTION_KEYS = [
  "hero",
  "about",
  "services",
  "gallery",
  "reviews",
  "contact",
] as const;

export type MeccaHomeSectionKey = (typeof MECCA_HOME_SECTION_KEYS)[number];

type MeccaBlockDefaults = {
  eyebrow?: string;
  title?: string;
  text?: string;
  cta_label?: string;
  badge_tiny?: string;
  badge_medium?: string;
  badge_large?: string;
};

export const MECCA_SECTION_META: Record<
  MeccaHomeSectionKey,
  {
    key: MeccaHomeSectionKey;
    label: string;
    showKey: keyof NonNullable<MinisiteContent["show"]>;
    defaults: MeccaBlockDefaults;
  }
> = {
  hero: {
    key: "hero",
    label: "Hero",
    showKey: "cover",
    defaults: {
      eyebrow: "PREMIUM SALON",
      title: "Erlebe deinen besten Look.",
      badge_tiny: "JETZT BUCHEN",
    },
  },
  about: {
    key: "about",
    label: "Über uns",
    showKey: "about",
    defaults: {
      eyebrow: "UNSERE GESCHICHTE",
      title: "Leidenschaft für Schönheit.",
      text: "Wir setzen Maßstäbe...",
    },
  },
  services: {
    key: "services",
    label: "Leistungen",
    showKey: "prices",
    defaults: {
      eyebrow: "LEISTUNGEN",
      title: "Maßgeschneidert für dich.",
      cta_label: "ALLE LEISTUNGEN",
    },
  },
  gallery: {
    key: "gallery",
    label: "Galerie",
    showKey: "gallery",
    defaults: {
      eyebrow: "VERWANDLUNGEN",
      title: "Vorher & Nachher.",
    },
  },
  reviews: {
    key: "reviews",
    label: "Bewertungen",
    showKey: "about",
    defaults: {
      eyebrow: "STIMMEN UNSERER KUNDEN",
      title: "Was unsere Kunden sagen.",
    },
  },
  contact: {
    key: "contact",
    label: "Kontakt & Zeiten",
    showKey: "location",
    defaults: {
      eyebrow: "STANDORT & ZEITEN",
      title: "Besuche uns.",
    },
  },
};

function isMeccaHomeKey(value: string): value is MeccaHomeSectionKey {
  return (MECCA_HOME_SECTION_KEYS as readonly string[]).includes(value);
}

export function resolveMeccaHomeSectionOrder(content: MinisiteContent): MeccaHomeSectionKey[] {
  const raw = (content.section_order as string[] | undefined)?.filter(isMeccaHomeKey) ?? [];
  const seen = new Set<MeccaHomeSectionKey>();
  const ordered: MeccaHomeSectionKey[] = [];

  for (const key of raw) {
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }

  for (const key of MECCA_HOME_SECTION_KEYS) {
    if (!seen.has(key)) {
      ordered.push(key);
    }
  }

  return ordered;
}

export function isMeccaSectionVisible(
  key: MeccaHomeSectionKey,
  content: MinisiteContent,
): boolean {
  const show = content.show ?? {};
  const meta = MECCA_SECTION_META[key];
  return show[meta.showKey] !== false;
}
