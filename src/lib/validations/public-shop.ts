import { z } from "zod";

import { openingHoursSchema } from "@/lib/validations/shop";
import { minisiteLinksSchema } from "@/lib/validations/minisite-links";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const minisiteTemplateSchema = z.enum(["classic", "midnight", "bold"]);

export const minisiteContentSchema = z
  .object({
    hero_headline: z.string().trim().max(120).optional(),
    about: z.string().trim().max(2000).optional(),
    address: z.string().trim().max(300).optional(),
    instagram: z.string().trim().max(80).optional(),
    links: minisiteLinksSchema,
    gallery: z.array(z.string().trim().min(1)).max(8).optional(),
    team_order: z.array(z.string().uuid()).optional(),
    show: z
      .object({
        about: z.boolean().optional(),
        gallery: z.boolean().optional(),
        team: z.boolean().optional(),
        location: z.boolean().optional(),
      })
      .optional(),
    logo_path: z.string().trim().min(1).optional(),
    cover_path: z.string().trim().min(1).optional(),
  })
  .strict();

export const publicShopServiceSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    duration_min: z.number().int().positive(),
    price_cents: z.number().int().nonnegative(),
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
] as const;
export const SHOP_PUBLIC_SERVICE_KEYS = [
  "id",
  "name",
  "duration_min",
  "price_cents",
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
