import type { MinisiteContent } from "@/lib/validations/public-shop";

import { resolveNicolesGalleryImage } from "./nicoles-stock-images";

export const NICOLES_HOME_SECTION_KEYS = [
  "hero",
  "about",
  "salon_banner",
  "services",
  "aktionstage",
  "team",
  "news",
  "pre_footer",
] as const;

export type NicolesHomeSectionKey = (typeof NICOLES_HOME_SECTION_KEYS)[number];

type NicolesBlockDefaults = {
  eyebrow?: string;
  title?: string;
  text?: string;
  cta_label?: string;
  badge_tiny?: string;
  badge_medium?: string;
  badge_large?: string;
};

export const NICOLES_SECTION_META: Record<
  NicolesHomeSectionKey,
  {
    key: NicolesHomeSectionKey;
    label: string;
    showKey: keyof NonNullable<MinisiteContent["show"]>;
    defaults: NicolesBlockDefaults;
  }
> = {
  hero: {
    key: "hero",
    label: "Hero",
    showKey: "cover",
    defaults: {
      title: "Lebensgefühl bis in die Spitzen.",
      badge_tiny: "SPECIAL-DEAL!",
      badge_medium: "JEDEN DIENSTAG",
      badge_large: "SENIOREN TAG",
    },
  },
  about: {
    key: "about",
    label: "Über uns Vorschau",
    showKey: "about",
    defaults: {
      eyebrow: "UNSER FRISEUR- UND BARBERSHOP",
      title: "Hier steht Dein Wohlbefinden und deine Individualität an erster Stelle.",
      text: "Ob klassischer Haarschnitt, moderner Style oder individuelle Beratung — bei uns bist du in besten Händen. Für Damen, Herren und Kinder.",
      cta_label: "MEHR ÜBER UNS",
    },
  },
  salon_banner: {
    key: "salon_banner",
    label: "Salon Banner",
    showKey: "salon_banner",
    defaults: {
      title: "Komm rein und lass dich verwöhnen – wir freuen uns auf dich!",
    },
  },
  services: {
    key: "services",
    label: "Leistungen Vorschau",
    showKey: "prices",
    defaults: {
      eyebrow: "UNSERE LEISTUNGEN",
      title:
        "Waschen. Schneiden. Föhnen für kurze, mittlere und lange Haare. Alle Leistungen für Damen, Herren und Kinder.",
      text: "Von klassisch bis modern — wir finden den Look, der zu dir passt.",
      cta_label: "ZU DEN LEISTUNGEN",
    },
  },
  aktionstage: {
    key: "aktionstage",
    label: "Aktionstage",
    showKey: "aktionstage",
    defaults: {
      eyebrow: "UNSERE AKTIONSTAGE",
      title: "Jede Woche starke Angebote!",
      text: "Dienstag|Seniorentag – 20 € Herren / 30 € Damen\nMittwoch|Schüler / Studenten / Azubis – alle Cuts 20 €",
    },
  },
  team: {
    key: "team",
    label: "Team Vorschau",
    showKey: "team",
    defaults: {
      eyebrow: "ÜBER UNS",
      title: "Stylisch. Herzlich. Für alle.",
      text: "Unser Team verbindet Handwerk mit Herz — damit du dich vom ersten Moment an wohlfühlst.",
      cta_label: "LERNE UNSER TEAM KENNEN",
    },
  },
  news: {
    key: "news",
    label: "Aktuelles",
    showKey: "news",
    defaults: {
      eyebrow: "AKTUELLES",
      title: "Kommende Aktionen und Informationen",
    },
  },
  pre_footer: {
    key: "pre_footer",
    label: "Pre-Footer",
    showKey: "pre_footer",
    defaults: {},
  },
};

export const DEFAULT_NICOLES_NEWS: NonNullable<MinisiteContent["nicoles_news"]> = [
  { id: "news-1", title: "Seniorentag jeden Dienstag" },
  { id: "news-2", title: "Neue Pflegeprodukte im Shop" },
  { id: "news-3", title: "Walk-ins willkommen" },
];

export function editableNicolesNewsItem(
  content: MinisiteContent,
  index: number,
): NonNullable<MinisiteContent["nicoles_news"]>[number] {
  const saved = content.nicoles_news?.[index];
  if (saved) {
    return saved;
  }
  return DEFAULT_NICOLES_NEWS[index] ?? { id: `news-${index + 1}`, title: "" };
}

export function patchNicolesNewsItem(
  content: MinisiteContent,
  index: number,
  patch: Partial<{ title: string; image_path: string | undefined }>,
): MinisiteContent {
  const items = [...(content.nicoles_news ?? [])];
  while (items.length <= index) {
    const fallback = DEFAULT_NICOLES_NEWS[items.length];
    items.push(fallback ?? { id: `news-${items.length + 1}`, title: "" });
  }
  const previous = editableNicolesNewsItem(content, index);
  items[index] = {
    ...previous,
    ...items[index],
    ...patch,
    id: items[index]?.id ?? previous.id,
  };
  const kept = items.filter((item) => item.title.trim() || item.image_path);
  return { ...content, nicoles_news: kept.length ? kept : undefined };
}

function isNicolesHomeKey(value: string): value is NicolesHomeSectionKey {
  return (NICOLES_HOME_SECTION_KEYS as readonly string[]).includes(value);
}

export function resolveNicolesHomeSectionOrder(content: MinisiteContent): NicolesHomeSectionKey[] {
  const raw = content.section_order?.filter(isNicolesHomeKey) ?? [];
  const seen = new Set<NicolesHomeSectionKey>();
  const ordered: NicolesHomeSectionKey[] = [];

  for (const key of raw) {
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }

  for (const key of NICOLES_HOME_SECTION_KEYS) {
    if (!seen.has(key)) {
      ordered.push(key);
    }
  }

  return ordered;
}

export function isNicolesSectionVisible(
  key: NicolesHomeSectionKey,
  content: MinisiteContent,
): boolean {
  const show = content.show ?? {};
  const meta = NICOLES_SECTION_META[key];
  return show[meta.showKey] !== false;
}

type BlockField = "eyebrow" | "title" | "text" | "cta_label" | "badge_tiny" | "badge_medium" | "badge_large";

export function getNicolesSectionField(
  content: MinisiteContent,
  key: NicolesHomeSectionKey,
  field: BlockField,
  fallback: string,
): string {
  const block = content.sections?.[key];
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (key === "hero" && field === "title") {
    return content.hero_headline?.trim() || fallback;
  }
  if (key === "about" && field === "text") {
    return content.about?.trim() || fallback;
  }

  return fallback;
}

export function resolveNicolesNews(content: MinisiteContent) {
  if (content.nicoles_news?.length) {
    return content.nicoles_news;
  }
  return DEFAULT_NICOLES_NEWS;
}

/** Parse aktionstage rows: "Day|Label" per line. */
export function parseAktionstageRows(text: string): Array<{ day: string; label: string }> {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|");
      if (pipe === -1) {
        return { day: line, label: line };
      }
      return {
        day: line.slice(0, pipe).trim(),
        label: line.slice(pipe + 1).trim(),
      };
    });
}

export function galleryPath(content: MinisiteContent, index: number): string {
  return resolveNicolesGalleryImage(content, index);
}

export function sectionImagePaths(content: MinisiteContent, key: NicolesHomeSectionKey): string[] {
  const fromBlock = content.sections?.[key]?.image_paths ?? [];
  if (fromBlock.length > 0) {
    return fromBlock;
  }
  return [];
}
