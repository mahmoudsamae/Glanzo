import { z } from "zod";

import { openingHoursSchema } from "@/lib/validations/shop";
import { minisiteLinksSchema } from "@/lib/validations/minisite-links";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const boutiqueSectionKeySchema = z.enum([
  "hero",
  "services",
  "about",
  "promo",
  "prices",
  "gallery",
  "team",
  "guidelines",
  "visit",
]);

/** Boutique keys + Nicoles homepage-only blocks (ignored by boutique shell). */
export const minisiteSectionKeySchema = z.enum([
  "hero",
  "services",
  "about",
  "promo",
  "prices",
  "gallery",
  "team",
  "guidelines",
  "visit",
  "reviews",
  "contact",
  "salon_banner",
  "aktionstage",
  "news",
  "pre_footer",
  "social",
]);

export const minisiteSectionBlockSchema = z
  .object({
    eyebrow: z.string().trim().max(80).optional(),
    title: z.string().trim().max(200).optional(),
    subtitle: z.string().trim().max(4000).optional(),
    text: z.string().trim().max(4000).optional(),
    layout: z.enum(["filmstrip", "grid"]).optional(),
    cta_label: z.string().trim().max(80).optional(),
    image_path: z.string().trim().min(1).optional(),
    image_paths: z.array(z.string().trim().min(1)).max(8).optional(),
    badge_tiny: z.string().trim().max(80).optional(),
    badge_medium: z.string().trim().max(80).optional(),
    badge_large: z.string().trim().max(80).optional(),
  })
  .strict();

export const nicolesNewsItemSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    title: z.string().trim().min(1).max(160),
    image_path: z.string().trim().min(1).optional(),
  })
  .strict();

export const nicolesServiceCardSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    title: z.string().trim().min(1).max(120),
    image_path: z.string().trim().min(1).optional(),
  })
  .strict();

export const nicolesPriceRowSchema = z
  .object({
    id: z.string().trim().min(1).max(64).optional(),
    label: z.string().trim().min(1).max(160),
    price: z.string().trim().min(1).max(40),
  })
  .strict();

export const nicolesPriceSectionSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    title: z.string().trim().min(1).max(80),
    rows: z.array(nicolesPriceRowSchema).max(24).optional(),
  })
  .strict();

export const minisiteSectionsConfigSchema = z
  .object({
    hero: minisiteSectionBlockSchema.optional(),
    services: minisiteSectionBlockSchema.optional(),
    about: minisiteSectionBlockSchema.optional(),
    promo: minisiteSectionBlockSchema.optional(),
    prices: minisiteSectionBlockSchema.optional(),
    gallery: minisiteSectionBlockSchema.optional(),
    team: minisiteSectionBlockSchema.optional(),
    guidelines: minisiteSectionBlockSchema.optional(),
    visit: minisiteSectionBlockSchema.optional(),
    nav: minisiteSectionBlockSchema.optional(),
    salon_banner: minisiteSectionBlockSchema.optional(),
    aktionstage: minisiteSectionBlockSchema.optional(),
    news: minisiteSectionBlockSchema.optional(),
    pre_footer: minisiteSectionBlockSchema.optional(),
    booking: minisiteSectionBlockSchema.optional(),
    contact: minisiteSectionBlockSchema.optional(),
    reviews: minisiteSectionBlockSchema.optional(),
    social: minisiteSectionBlockSchema.optional(),
  })
  .strict();

export const navLinkSchema = z
  .object({
    id: z.string().trim().min(1).max(40),
    label: z.string().trim().min(1).max(40),
    href: z.string().trim().max(80).optional(),
    visible: z.boolean().optional(),
  })
  .strict();

export const aboutBlockTypeSchema = z.enum([
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
]);

export const aboutBlockSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    type: aboutBlockTypeSchema,
    eyebrow: z.string().trim().max(120).optional(),
    title: z.string().trim().max(200).optional(),
    subtitle: z.string().trim().max(200).optional(),
    text: z.string().trim().max(4000).optional(),
    image_path: z.string().trim().min(1).optional(),
    image_paths: z.array(z.string().trim().min(1)).max(8).optional(),
    layout: z.enum(["normal", "reversed"]).optional(),
  })
  .strict();

export const minisiteTemplateSchema = z.enum([
  "classic",
  "midnight",
  "bold",
  "signature",
  "flux",
  "boutique",
  "nicoles",
  "mecca",
  "forge",
  "velvet",
]);

export const minisiteContentSchema = z
  .object({
    hero_headline: z.string().trim().max(120).optional(),
    about: z.string().trim().max(2000).optional(),
    address: z.string().trim().max(300).optional(),
    phone: z.string().trim().max(40).optional(),
    email: z.string().trim().max(120).optional(),
    /** Visitor-facing instructions: house rules, parking, late policy, etc. */
    visitor_guidelines: z.string().trim().max(2000).optional(),
    /** Short notice near the booking CTA on the public mini-site. */
    booking_notice: z.string().trim().max(500).optional(),
    instagram: z.string().trim().max(80).optional(),
    links: minisiteLinksSchema,
    gallery: z.array(z.string().trim().min(1)).max(8).optional(),
    team_order: z.array(z.string().uuid()).optional(),
    section_order: z.array(minisiteSectionKeySchema).optional(),
    sections: minisiteSectionsConfigSchema.optional(),
    nicoles_news: z.array(nicolesNewsItemSchema).max(6).optional(),
    nicoles_service_cards: z.array(nicolesServiceCardSchema).max(8).optional(),
    nicoles_price_sections: z.array(nicolesPriceSectionSchema).max(12).optional(),
    nav_links: z.array(navLinkSchema).max(8).optional(),
    about_blocks: z.array(aboutBlockSchema).max(24).optional(),
    show: z
      .object({
        about: z.boolean().optional(),
        cover: z.boolean().optional(),
        gallery: z.boolean().optional(),
        team: z.boolean().optional(),
        location: z.boolean().optional(),
        prices: z.boolean().optional(),
        hours: z.boolean().optional(),
        social: z.boolean().optional(),
        guidelines: z.boolean().optional(),
        salon_banner: z.boolean().optional(),
        aktionstage: z.boolean().optional(),
        news: z.boolean().optional(),
        pre_footer: z.boolean().optional(),
      })
      .optional(),
    logo_path: z.string().trim().min(1).optional(),
    cover_path: z.string().trim().min(1).optional(),
    /** Velvet hero background video (shop-media hero_video/). */
    cover_video_path: z.string().trim().min(1).optional(),
  })
  .strict();

export const publicShopServiceSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    duration_min: z.number().int().positive(),
    price_cents: z.number().int().nonnegative(),
    description: z.string().nullable().optional(),
    image_path: z.string().nullable().optional(),
    show_price: z.boolean().default(true),
  })
  .strict();

export const publicShopTeamMemberSchema = z
  .object({
    membership_id: z.string().uuid(),
    display_name: z.string(),
  })
  .strict();

export const publicShopInfoSchema = z
  .object({
    name: z.string(),
    slug: z.string(),
    status: z.enum(["active", "suspended"]),
    timezone: z.string(),
    opening_hours: openingHoursSchema,
    booking_auto_assign_barber: z.boolean().default(true),
  })
  .strict();

export const publicMinisiteSchema = z
  .object({
    template: minisiteTemplateSchema,
    accent_hex: hexColorSchema,
    content: minisiteContentSchema,
  })
  .strict();

/** Exact RPC key allow-lists — matrix tests fail if a new field ships unlisted. */
export const SHOP_PUBLIC_DATA_ROOT_KEYS = ["shop", "services", "team", "minisite"] as const;
export const SHOP_PUBLIC_SHOP_KEYS = [
  "name",
  "slug",
  "status",
  "timezone",
  "opening_hours",
  "booking_auto_assign_barber",
] as const;
export const SHOP_PUBLIC_SERVICE_KEYS = [
  "id",
  "name",
  "duration_min",
  "price_cents",
  "description",
  "image_path",
  "show_price",
] as const;
export const SHOP_PUBLIC_TEAM_KEYS = ["membership_id", "display_name"] as const;
export const SHOP_PUBLIC_MINISITE_KEYS = ["template", "accent_hex", "content"] as const;

/** Whitelisted RPC payload — extra keys fail loudly in dev. */
export const shopPublicDataSchema = z
  .object({
    shop: publicShopInfoSchema,
    services: z.array(publicShopServiceSchema),
    team: z.array(publicShopTeamMemberSchema),
    minisite: publicMinisiteSchema,
  })
  .strict();

export type ShopPublicData = z.infer<typeof shopPublicDataSchema>;
export type MinisiteContent = z.infer<typeof minisiteContentSchema>;
export type MinisiteTemplate = z.infer<typeof minisiteTemplateSchema>;

/** Parse at cache boundary — prod hides bad sections via caller fallback. */
export function parseShopPublicData(
  raw: unknown,
): { ok: true; data: ShopPublicData } | { ok: false; error: z.ZodError } {
  const parsed = shopPublicDataSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error };
  }
  return { ok: true, data: parsed.data };
}
