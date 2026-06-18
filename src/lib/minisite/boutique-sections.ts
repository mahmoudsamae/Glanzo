import type { MinisiteContent } from "@/lib/validations/public-shop";
import type { ShopPublicData } from "@/lib/validations/public-shop";

export const BOUTIQUE_SECTION_KEYS = [
  "hero",
  "services",
  "about",
  "promo",
  "prices",
  "gallery",
  "team",
  "guidelines",
  "visit",
] as const;

export type BoutiqueSectionKey = (typeof BOUTIQUE_SECTION_KEYS)[number];

export type BoutiqueGalleryLayout = "filmstrip" | "grid";

export type BoutiqueSectionBlock = {
  eyebrow?: string;
  title?: string;
  text?: string;
  layout?: BoutiqueGalleryLayout;
};

export const DEFAULT_BOUTIQUE_SECTION_ORDER: BoutiqueSectionKey[] = [...BOUTIQUE_SECTION_KEYS];

type ShowKey = keyof NonNullable<MinisiteContent["show"]>;

export type BoutiqueSectionMeta = {
  key: BoutiqueSectionKey;
  label: string;
  description: string;
  /** Primary show toggle for this block in the editor. */
  showKey: ShowKey;
  defaults: BoutiqueSectionBlock;
};

export const BOUTIQUE_SECTION_META: Record<BoutiqueSectionKey, BoutiqueSectionMeta> = {
  hero: {
    key: "hero",
    label: "Hero / Start",
    description: "Willkommen, Überschrift und Titelbild",
    showKey: "cover",
    defaults: {
      eyebrow: "Willkommen",
      title: "",
      text: "Lehn dich zurück, genieße die entspannte Atmosphäre und lass dich rundum verwöhnen — wir freuen uns auf dich!",
    },
  },
  services: {
    key: "services",
    label: "Leistungen",
    description: "Service-Kacheln mit Preisen",
    showKey: "prices",
    defaults: {
      eyebrow: "Unsere Leistungen",
      title: "Waschen, Schneiden, Styling — für jeden Look.",
    },
  },
  about: {
    key: "about",
    label: "Über uns",
    description: "Text und Foto-Collage",
    showKey: "about",
    defaults: {
      eyebrow: "Über uns",
      title: "Stylisch. Herzlich. Für alle.",
    },
  },
  promo: {
    key: "promo",
    label: "Promo-Band",
    description: "Buchungsaufruf mit Titelbild",
    showKey: "cover",
    defaults: {
      eyebrow: "Termin sichern",
      title: "Dein nächster Look wartet",
      text: "Online buchen — Bestätigung in Sekunden.",
    },
  },
  prices: {
    key: "prices",
    label: "Preisliste",
    description: "Alle Leistungen und Preise",
    showKey: "prices",
    defaults: {
      eyebrow: "Leistungen",
      title: "Preise & Dauer",
    },
  },
  gallery: {
    key: "gallery",
    label: "Galerie",
    description: "Fotos — Filmstrip oder Raster",
    showKey: "gallery",
    defaults: {
      eyebrow: "Fotogalerie",
      title: "Einblicke in unseren Salon",
      layout: "filmstrip",
    },
  },
  team: {
    key: "team",
    label: "Team",
    description: "Meister und Buchungslinks",
    showKey: "team",
    defaults: {
      eyebrow: "Meister",
      title: "Unser Team",
    },
  },
  guidelines: {
    key: "guidelines",
    label: "Hinweise",
    description: "Regeln und Gäste-Infos",
    showKey: "guidelines",
    defaults: {
      eyebrow: "Etikette",
      title: "Hinweise für Gäste",
    },
  },
  visit: {
    key: "visit",
    label: "Kontakt & Footer",
    description: "Adresse, Öffnungszeiten, Social",
    showKey: "location",
    defaults: {
      title: "Termin vereinbaren",
    },
  },
};

export function isBoutiqueSectionKey(value: string): value is BoutiqueSectionKey {
  return (BOUTIQUE_SECTION_KEYS as readonly string[]).includes(value);
}

export function resolveBoutiqueSectionOrder(content: MinisiteContent): BoutiqueSectionKey[] {
  const raw = content.section_order?.filter(isBoutiqueSectionKey) ?? [];
  const seen = new Set<BoutiqueSectionKey>();
  const ordered: BoutiqueSectionKey[] = [];

  for (const key of raw) {
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }

  for (const key of DEFAULT_BOUTIQUE_SECTION_ORDER) {
    if (!seen.has(key)) {
      ordered.push(key);
    }
  }

  return ordered;
}

export function isBoutiqueSectionVisible(
  key: BoutiqueSectionKey,
  content: MinisiteContent,
  data?: ShopPublicData,
): boolean {
  const show = content.show ?? {};

  switch (key) {
    case "hero":
      return true;
    case "services":
      return show.prices !== false && (data?.services.length ?? 0) > 0;
    case "about":
      return show.about !== false || show.gallery !== false;
    case "promo":
      return show.cover !== false;
    case "prices":
      return show.prices !== false && (data?.services.length ?? 0) > 0;
    case "gallery":
      return show.gallery !== false && (content.gallery?.length ?? 0) > 0;
    case "team":
      return show.team !== false && (data?.team.length ?? 0) > 0;
    case "guidelines":
      return show.guidelines !== false;
    case "visit":
      return show.location !== false || show.hours !== false || show.social !== false;
    default:
      return true;
  }
}

export function getBoutiqueSectionBlock(
  content: MinisiteContent,
  key: BoutiqueSectionKey,
): BoutiqueSectionBlock {
  return content.sections?.[key] ?? {};
}

export function getBoutiqueSectionField(
  content: MinisiteContent,
  key: BoutiqueSectionKey,
  field: keyof BoutiqueSectionBlock,
  fallback: string,
): string {
  const block = getBoutiqueSectionBlock(content, key);
  const value = block[field];
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (key === "hero" && field === "title") {
    return content.hero_headline?.trim() || fallback;
  }
  if (key === "hero" && field === "text") {
    return content.about?.trim() || fallback;
  }
  if (key === "about" && field === "text") {
    return content.about?.trim() || fallback;
  }
  if (key === "guidelines" && field === "text") {
    return content.visitor_guidelines?.trim() || fallback;
  }
  if (key === "promo" && field === "text") {
    return content.booking_notice?.trim() || fallback;
  }

  return fallback;
}

export function getBoutiqueGalleryLayout(content: MinisiteContent): BoutiqueGalleryLayout {
  return getBoutiqueSectionBlock(content, "gallery").layout ?? "filmstrip";
}

export function patchBoutiqueSectionBlock(
  content: MinisiteContent,
  key: BoutiqueSectionKey,
  patch: Partial<BoutiqueSectionBlock>,
): MinisiteContent {
  const sections = { ...(content.sections ?? {}) };
  sections[key] = { ...(sections[key] ?? {}), ...patch };
  return { ...content, sections };
}

export function moveBoutiqueSectionOrder(
  content: MinisiteContent,
  index: number,
  direction: -1 | 1,
): MinisiteContent {
  const order = resolveBoutiqueSectionOrder(content);
  const target = index + direction;
  if (target < 0 || target >= order.length) {
    return content;
  }
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return { ...content, section_order: next };
}

export function setBoutiqueSectionVisible(
  content: MinisiteContent,
  key: BoutiqueSectionKey,
  visible: boolean,
): MinisiteContent {
  const meta = BOUTIQUE_SECTION_META[key];
  const show = { ...(content.show ?? {}), [meta.showKey]: visible };

  if (key === "about" && !visible) {
    show.gallery = false;
  }
  if (key === "visit" && !visible) {
    show.location = false;
    show.hours = false;
    show.social = false;
  }
  if (key === "visit" && visible) {
    show.location = true;
    show.hours = true;
    show.social = true;
  }

  return { ...content, show };
}

export function isBoutiqueSectionEnabled(content: MinisiteContent, key: BoutiqueSectionKey): boolean {
  const show = content.show ?? {};
  const meta = BOUTIQUE_SECTION_META[key];

  if (key === "hero") {
    return show.cover !== false;
  }
  if (key === "visit") {
    return show.location !== false || show.hours !== false || show.social !== false;
  }
  if (key === "about") {
    return show.about !== false;
  }

  return show[meta.showKey] !== false;
}
