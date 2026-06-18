import type { MinisiteContent } from "@/lib/validations/public-shop";

export const ABOUT_BLOCK_TYPES = [
  "page_hero",
  "intro",
  "team_heading",
  "team_profile",
  "salon_intro",
  "image_stack",
  "language_band",
  "collage",
  "cta",
  "split_footer",
] as const;

export type AboutBlockType = (typeof ABOUT_BLOCK_TYPES)[number];

export type AboutBlock = {
  id: string;
  type: AboutBlockType;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  image_path?: string;
  image_paths?: string[];
  layout?: "normal" | "reversed";
};

export type NavLink = {
  id: string;
  label: string;
  href?: string;
  visible?: boolean;
};

export const DEFAULT_NAV_LINKS: NavLink[] = [
  { id: "nav-home", label: "Home", href: "#ms-boutique-top", visible: true },
  { id: "nav-about", label: "Über uns", href: "#ms-boutique-about", visible: true },
  {
    id: "nav-prices",
    label: "Leistungen & Preise",
    href: "#ms-boutique-prices",
    visible: true,
  },
  { id: "nav-book", label: "Terminbuchung", href: "__book__", visible: true },
  { id: "nav-contact", label: "Kontakt", href: "#ms-boutique-contact", visible: true },
];

export const ABOUT_BLOCK_TYPE_LABELS: Record<AboutBlockType, string> = {
  page_hero: "Titelbild (Hero)",
  intro: "Über uns — Überschrift & Text",
  team_heading: "Team — Zwischenüberschrift",
  team_profile: "Team — Person (Foto + Bio)",
  salon_intro: "Salon — Intro mit 2 Fotos",
  image_stack: "Bilder — Vollbreite untereinander",
  language_band: "Sprach-Band (Teal)",
  collage: "Foto-Collage (4 Bilder)",
  cta: "Button — Termin buchen",
  split_footer: "Abschluss — 2 Fotos + Logo",
};

export function resolveNavLinks(content: MinisiteContent): NavLink[] {
  const raw = content.nav_links ?? [];
  const links = raw.filter((link) => link.visible !== false && link.label.trim());
  if (links.length > 0) {
    return links;
  }
  return DEFAULT_NAV_LINKS;
}

export function resolveAboutBlocks(content: MinisiteContent): AboutBlock[] {
  if (content.about_blocks?.length) {
    return content.about_blocks;
  }
  return defaultAboutBlocks(content);
}

export function defaultAboutBlocks(content: MinisiteContent): AboutBlock[] {
  const aboutText =
    content.about?.trim() ||
    "Ob moderner Damenstyle oder klassischer Barbershop-Cut – wir sind Expert:innen für typgerechte Beratung, starke Schnitte und Colorationen mit Wow-Effekt.";

  return [
    {
      id: "about-hero",
      type: "page_hero",
      image_path: content.cover_path,
    },
    {
      id: "about-intro",
      type: "intro",
      eyebrow: "WO GUTES HANDWERK AUF ECHTE LEIDENSCHAFT TRIFFT.",
      title: "Über uns",
      text: `${aboutText}\n\nWir nehmen uns Zeit für dich – damit du den Salon mit einem guten Gefühl verlässt.`,
    },
    {
      id: "about-team-heading",
      type: "team_heading",
      eyebrow: "UNSER TEAM",
    },
    {
      id: "about-salon",
      type: "salon_intro",
      eyebrow: "UNSER FRISEUR- UND BARBERSHOP",
      title: "Ein Salon für alle Styles & jedes Alter.",
      text: "Fair, familiär und für jede:n gemacht: Frauen, Männer, Kinder, Schüler & Senioren. Mit getrennten Bereichen für Damen & Herren.",
      image_paths: content.gallery?.slice(0, 2),
    },
    {
      id: "about-language",
      type: "language_band",
      text: "Wir sprechen Deutsch, Englisch & Arabisch – damit du dich bei uns rundum verstanden fühlst.",
    },
    {
      id: "about-collage",
      type: "collage",
      image_paths: content.gallery?.slice(0, 4),
    },
    {
      id: "about-cta",
      type: "cta",
      title: "Jetzt Termin vereinbaren",
    },
  ];
}

export function createAboutBlock(type: AboutBlockType): AboutBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title: type === "intro" ? "Über uns" : undefined,
    eyebrow: type === "team_heading" ? "UNSER TEAM" : undefined,
  };
}

export function moveAboutBlock(blocks: AboutBlock[], index: number, direction: -1 | 1): AboutBlock[] {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) {
    return blocks;
  }
  const next = [...blocks];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}

export function patchAboutBlock(blocks: AboutBlock[], id: string, patch: Partial<AboutBlock>): AboutBlock[] {
  return blocks.map((block) => (block.id === id ? { ...block, ...patch } : block));
}

export function removeAboutBlock(blocks: AboutBlock[], id: string): AboutBlock[] {
  return blocks.filter((block) => block.id !== id);
}

export function moveNavLink(links: NavLink[], index: number, direction: -1 | 1): NavLink[] {
  const target = index + direction;
  if (target < 0 || target >= links.length) {
    return links;
  }
  const next = [...links];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}

export function navHrefTarget(href: string | undefined, fallbackId: string): string {
  if (!href || href === "__book__") {
    return fallbackId;
  }
  return href.startsWith("#") ? href.slice(1) : href;
}

export function isBookNavLink(link: NavLink): boolean {
  return link.href === "__book__";
}
