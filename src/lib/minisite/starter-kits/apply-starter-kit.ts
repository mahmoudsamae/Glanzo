import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import type { StarterKitApplyContext, StarterKitDefinition } from "./types";

function interpolate(text: string, ctx: StarterKitApplyContext): string {
  return text
    .replaceAll("{{shopName}}", ctx.shopName.trim())
    .replaceAll("{{shopSlug}}", ctx.shopSlug.trim());
}

function interpolateContent(
  partial: Partial<MinisiteContent>,
  ctx: StarterKitApplyContext,
): MinisiteContent {
  const next: MinisiteContent = {};

  if (partial.hero_headline) {
    next.hero_headline = interpolate(partial.hero_headline, ctx);
  }
  if (partial.about) {
    next.about = interpolate(partial.about, ctx);
  }
  if (partial.booking_notice) {
    next.booking_notice = interpolate(partial.booking_notice, ctx);
  }
  if (partial.visitor_guidelines) {
    next.visitor_guidelines = interpolate(partial.visitor_guidelines, ctx);
  }
  if (partial.address) {
    next.address = interpolate(partial.address, ctx);
  }
  if (partial.show) {
    next.show = { ...partial.show };
  }
  if (partial.section_order) {
    next.section_order = [...partial.section_order];
  }
  if (partial.sections) {
    next.sections = { ...partial.sections };
  }
  if (partial.nav_links) {
    next.nav_links = [...partial.nav_links];
  }
  if (partial.about_blocks) {
    next.about_blocks = partial.about_blocks.map((block) => ({ ...block }));
  }
  if (partial.links) {
    next.links = { ...partial.links };
  }
  if (partial.nicoles_news) {
    next.nicoles_news = partial.nicoles_news.map((item) => ({ ...item }));
  }
  if (partial.nicoles_service_cards) {
    next.nicoles_service_cards = partial.nicoles_service_cards.map((card) => ({ ...card }));
  }
  if (partial.nicoles_price_sections) {
    next.nicoles_price_sections = partial.nicoles_price_sections.map((section) => ({
      ...section,
      rows: section.rows?.map((row) => ({ ...row })),
    }));
  }

  return next;
}

export type ApplyStarterKitOptions = {
  /** Keep uploaded media paths from the current draft. */
  preserveMedia?: boolean;
  /** Keep social links from the current draft. */
  preserveLinks?: boolean;
};

export function applyStarterKit(
  kit: StarterKitDefinition,
  ctx: StarterKitApplyContext,
  current?: Pick<MinisiteSaveInput, "content">,
  options: ApplyStarterKitOptions = { preserveMedia: true, preserveLinks: true },
): MinisiteSaveInput {
  const kitContent = interpolateContent(kit.content, ctx);
  const mergedAddress =
    ctx.address?.trim() || kitContent.address || current?.content.address;

  const content: MinisiteContent = {
    ...kitContent,
    address: mergedAddress || undefined,
  };

  if (options.preserveMedia && current?.content) {
    if (current.content.logo_path) content.logo_path = current.content.logo_path;
    if (current.content.cover_path) content.cover_path = current.content.cover_path;
    if (current.content.gallery?.length) content.gallery = current.content.gallery;
  }

  if (options.preserveLinks && current?.content?.links) {
    content.links = { ...current.content.links };
  }

  return {
    template: kit.template,
    accentHex: kit.accentHex,
    content,
  };
}
