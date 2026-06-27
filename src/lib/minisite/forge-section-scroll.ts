import type { ForgeHomeSectionKey } from "@/lib/minisite/forge-sections";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";

/** DOM ids used as scroll targets between Forge homepage sections. */
export const FORGE_HOME_SECTION_IDS: Record<ForgeHomeSectionKey, string> = {
  hero: "ms-forge-top",
  about: "ms-nicoles-about",
  salon_banner: "ms-forge-salon-banner",
  services: "ms-nicoles-services",
  aktionstage: "ms-forge-aktionstage",
  team: "ms-nicoles-team",
  news: "ms-forge-news",
  pre_footer: "ms-forge-pre-footer",
};

export function forgeHomeSectionHash(key: ForgeHomeSectionKey): string {
  return `#${FORGE_HOME_SECTION_IDS[key]}`;
}

export function forgeFooterContactHash(): string {
  return `#${getMinisiteAnchors("forge").contact}`;
}

export function nextForgeHomeSectionHash(
  order: ForgeHomeSectionKey[],
  currentKey: ForgeHomeSectionKey,
): string {
  const index = order.indexOf(currentKey);
  const next = index >= 0 ? order[index + 1] : undefined;
  if (!next) {
    return forgeFooterContactHash();
  }
  return forgeHomeSectionHash(next);
}
