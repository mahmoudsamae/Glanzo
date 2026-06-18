import type { AboutBlock } from "@/lib/minisite/about-blocks";
import { nicolesStockTeam, resolveNicolesAboutHeroImage } from "@/lib/minisite/nicoles-stock-images";
import type { MinisiteContent } from "@/lib/validations/public-shop";

const DEFAULT_ABOUT_STORY = `Seit über 30 Jahren steht unser Salon für Handwerk, Stil und persönliche Beratung. Wir glauben daran, dass jeder Mensch einzigartig ist — deshalb nehmen wir uns Zeit für dich.

In getrennten Bereichen für Damen und Herren bieten wir dir eine entspannte Atmosphäre und Service, der auf deine Wünsche eingeht. Ob klassischer Schnitt, moderne Coloration oder ein gepflegter Bart — bei uns bist du in besten Händen.

Unser Anspruch: ehrliche Beratung, präzises Handwerk und ein Lächeln, das du mit nach Hause nimmst.`;

const DEFAULT_NICOLE_BIO =
  "Als Gründerin und Friseurmeisterin führt Nicole den Salon mit Leidenschaft und einem Auge fürs Detail. Ihre Stärke: typgerechte Beratung und Looks, die zu dir passen — nicht zum Trend.";

const DEFAULT_MEMBER_2_BIO =
  "Spezialisiert auf Herren- und Barbershop-Schnitte — präzise, klassisch und modern. Im Herrenbereich sorgt unser Team für einen Look, der sitzt.";

const DEFAULT_MEMBER_3_BIO =
  "Coloration, Styling und Pflege für Damen — mit Gespür für Nuancen und Farben, die deinen Typ unterstreichen.";

export function defaultNicolesAboutBlocks(content: MinisiteContent): AboutBlock[] {
  const story = content.about?.trim() || DEFAULT_ABOUT_STORY;

  return [
    {
      id: "nicoles-about-hero",
      type: "page_hero",
      image_path: resolveNicolesAboutHeroImage(content),
    },
    {
      id: "nicoles-about-intro",
      type: "intro",
      title: "Über uns",
      text: story,
    },
    {
      id: "nicoles-about-team-heading",
      type: "team_heading",
      eyebrow: "UNSER TEAM",
    },
    {
      id: "nicoles-about-nicole",
      type: "team_profile",
      title: "Nicole Al-Nussairi",
      subtitle: "GESCHÄFTSINHABERIN & FRISEURMEISTERIN",
      text: DEFAULT_NICOLE_BIO,
      layout: "normal",
      image_path: content.gallery?.[3] ?? nicolesStockTeam(0),
    },
    {
      id: "nicoles-about-member-2",
      type: "team_profile",
      title: "Unser Herren-Team",
      subtitle: "BARBER & STYLIST",
      text: DEFAULT_MEMBER_2_BIO,
      layout: "reversed",
      image_path: content.gallery?.[4] ?? nicolesStockTeam(1),
    },
    {
      id: "nicoles-about-member-3",
      type: "team_profile",
      title: "Unser Damen-Team",
      subtitle: "COLORATION & STYLING",
      text: DEFAULT_MEMBER_3_BIO,
      layout: "normal",
      image_path: content.gallery?.[5] ?? nicolesStockTeam(2),
    },
  ];
}

export function resolveNicolesAboutBlocks(content: MinisiteContent): AboutBlock[] {
  if (content.about_blocks?.length) {
    return content.about_blocks;
  }
  return defaultNicolesAboutBlocks(content);
}

export function splitParagraphs(text?: string): string[] {
  if (!text?.trim()) {
    return [];
  }
  return text
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
