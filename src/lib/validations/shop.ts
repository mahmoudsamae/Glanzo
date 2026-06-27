import { z } from "zod";

/**
 * Must stay in sync with `shops_slug_format` CHECK in
 * supabase/migrations/20250611210001_tables_rls.sql
 */
export const SHOP_SLUG_REGEX = /^[a-z0-9](-?[a-z0-9])*$/;

export const SHOP_SLUG_MIN_LENGTH = 3;
export const SHOP_SLUG_MAX_LENGTH = 40;

export const shopSlugSchema = z
  .string()
  .min(SHOP_SLUG_MIN_LENGTH)
  .max(SHOP_SLUG_MAX_LENGTH)
  .regex(SHOP_SLUG_REGEX, "Slug must be lowercase, URL-safe, 3–40 characters");

export type ShopSlug = z.infer<typeof shopSlugSchema>;

/** Per-weekday opening hours — validated in app; stored as shops.opening_hours jsonb. */
function isCloseAfterOpen(day: { open: string; close: string } | null): boolean {
  if (!day) return true;
  return day.close > day.open;
}

export const openingHoursDaySchema = z
  .object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .nullable()
  .refine(isCloseAfterOpen, { message: "Close time must be after open time" });

export const openingHoursSchema = z.object({
  mon: openingHoursDaySchema,
  tue: openingHoursDaySchema,
  wed: openingHoursDaySchema,
  thu: openingHoursDaySchema,
  fri: openingHoursDaySchema,
  sat: openingHoursDaySchema,
  sun: openingHoursDaySchema,
});

export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type WeekdayKey = (typeof WEEKDAY_ORDER)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag",
};

export function parseOpeningHours(value: unknown): OpeningHours | null {
  const result = openingHoursSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function isValidShopSlug(slug: string): boolean {
  return shopSlugSchema.safeParse(slug).success;
}

export const DEFAULT_ONBOARDING_OPENING_HOURS: OpeningHours = {
  mon: null,
  tue: { open: "09:00", close: "19:00" },
  wed: { open: "09:00", close: "19:00" },
  thu: { open: "09:00", close: "19:00" },
  fri: { open: "09:00", close: "19:00" },
  sat: { open: "09:00", close: "19:00" },
  sun: null,
};

export const createShopInputSchema = z.object({
  name: z.string().trim().min(2, "Shop name is too short").max(80),
  slug: shopSlugSchema,
  timezone: z.string().min(1),
  openingHours: openingHoursSchema,
});

export type CreateShopInput = z.infer<typeof createShopInputSchema>;
