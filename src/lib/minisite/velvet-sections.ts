import type { MinisiteContent } from "@/lib/validations/public-shop";

export const VELVET_HOME_SECTION_KEYS = [
  "hero",
  "about",
  "services",
  "gallery",
  "social",
  "contact",
] as const;

export type VelvetHomeSectionKey = (typeof VELVET_HOME_SECTION_KEYS)[number];

type VelvetBlockDefaults = {
  eyebrow?: string;
  title?: string;
  text?: string;
  cta_label?: string;
  badge_tiny?: string;
  badge_medium?: string;
  badge_large?: string;
};

export const VELVET_SECTION_META: Record<
  VelvetHomeSectionKey,
  {
    key: VelvetHomeSectionKey;
    label: string;
    showKey: keyof NonNullable<MinisiteContent["show"]>;
    defaults: VelvetBlockDefaults;
  }
> = {
  hero: {
    key: "hero",
    label: "Hero",
    showKey: "cover",
    defaults: {
      eyebrow: "NAIL ATELIER",
      title: "Nails as Art.",
      badge_tiny: "BOOK NOW",
    },
  },
  about: {
    key: "about",
    label: "Über die Künstlerin",
    showKey: "about",
    defaults: {
      eyebrow: "THE ARTIST",
      title: "Crafted with intention.",
      text: "Every set is handcrafted — a collaboration between artist and client, shaped by your vision and finished with precision.",
      cta_label: "Meet the Artist →",
      badge_tiny: "5+ Years",
      badge_medium: "1000+ Sets",
      badge_large: "5★ Rated",
    },
  },
  services: {
    key: "services",
    label: "Leistungen",
    showKey: "prices",
    defaults: {
      eyebrow: "THE MENU",
      title: "Curated Services.",
      cta_label: "View Full Menu →",
    },
  },
  gallery: {
    key: "gallery",
    label: "Galerie",
    showKey: "gallery",
    defaults: {
      eyebrow: "THE WORK",
      title: "Every nail, a canvas.",
    },
  },
  social: {
    key: "social",
    label: "Social",
    showKey: "social",
    defaults: {
      eyebrow: "FOLLOW THE ART",
      title: "Join the community.",
      cta_label: "Follow on Instagram →",
    },
  },
  contact: {
    key: "contact",
    label: "Kontakt & Öffnungszeiten",
    showKey: "location",
    defaults: {
      eyebrow: "VISIT US",
      title: "Find your way.",
    },
  },
};

function isVelvetHomeKey(value: string): value is VelvetHomeSectionKey {
  return (VELVET_HOME_SECTION_KEYS as readonly string[]).includes(value);
}

export function resolveVelvetHomeSectionOrder(content: MinisiteContent): VelvetHomeSectionKey[] {
  const raw = (content.section_order as string[] | undefined)?.filter(isVelvetHomeKey) ?? [];
  const seen = new Set<VelvetHomeSectionKey>();
  const ordered: VelvetHomeSectionKey[] = [];

  for (const key of raw) {
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }

  for (const key of VELVET_HOME_SECTION_KEYS) {
    if (!seen.has(key)) {
      ordered.push(key);
    }
  }

  return ordered;
}

export function isVelvetSectionVisible(
  key: VelvetHomeSectionKey,
  content: MinisiteContent,
): boolean {
  const show = content.show ?? {};
  const meta = VELVET_SECTION_META[key];
  return show[meta.showKey] !== false;
}

export function patchVelvetSectionBlock(
  content: MinisiteContent,
  key: VelvetHomeSectionKey,
  patch: Record<string, string | undefined>,
): MinisiteContent {
  const sections = { ...(content.sections ?? {}) } as NonNullable<MinisiteContent["sections"]>;
  sections[key] = { ...(sections[key] ?? {}), ...patch };
  return { ...content, sections };
}

export function setVelvetSectionVisible(
  content: MinisiteContent,
  key: VelvetHomeSectionKey,
  visible: boolean,
): MinisiteContent {
  const meta = VELVET_SECTION_META[key];
  return { ...content, show: { ...(content.show ?? {}), [meta.showKey]: visible } };
}

export function moveVelvetSectionOrder(
  content: MinisiteContent,
  index: number,
  direction: -1 | 1,
): MinisiteContent {
  const order = resolveVelvetHomeSectionOrder(content);
  const target = index + direction;
  if (target < 0 || target >= order.length) {
    return content;
  }
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return { ...content, section_order: next as MinisiteContent["section_order"] };
}

export function collectVelvetMediaPool(content: MinisiteContent): string[] {
  const pool = new Set<string>();
  for (const path of content.gallery ?? []) {
    pool.add(path);
  }
  if (content.cover_path) pool.add(content.cover_path);
  if (content.logo_path) pool.add(content.logo_path);
  const sections = content.sections ?? {};
  for (const key of VELVET_HOME_SECTION_KEYS) {
    const block = sections[key];
    if (block?.image_path) pool.add(block.image_path);
    for (const path of block?.image_paths ?? []) {
      pool.add(path);
    }
  }
  return [...pool];
}
