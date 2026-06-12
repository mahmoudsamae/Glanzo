import { z } from "zod";

export const platformStatusReasonSchema = z
  .string()
  .trim()
  .min(10, "Mindestens 10 Zeichen Begründung.");

export const platformShopStatusSchema = z.enum(["active", "suspended"]);

export const platformShopListItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  status: platformShopStatusSchema,
  created_at: z.string(),
  owner_display_name: z.string().nullable().optional(),
  owner_email: z.string().nullable().optional(),
  staff_count: z.number().int(),
  bookings_last_30d: z.number().int(),
  dead_outbox_count: z.number().int(),
});

export const platformShopListSchema = z.object({
  items: z.array(platformShopListItemSchema),
  next_cursor: z.string().nullable().optional(),
});

export const platformOverviewSchema = z.object({
  shops: z.object({
    total: z.number().int(),
    active: z.number().int(),
    suspended: z.number().int(),
  }),
  signups: z.object({
    last_7d: z.number().int(),
    last_30d: z.number().int(),
  }),
  bookings: z.object({
    last_7d: z.number().int(),
    last_30d: z.number().int(),
  }),
  outbox: z.object({
    pending: z.number().int(),
    dead: z.number().int(),
  }),
  recent_platform_actions: z.array(z.record(z.unknown())).default([]),
});

/** Forbidden customer/appointment PII fields — platform_get_shop must never return these. */
export const FORBIDDEN_PLATFORM_SHOP_DETAIL_KEYS = [
  "customer",
  "customers",
  "appointment",
  "appointments",
  "notes",
  "customer_name",
  "customer_email",
  "customer_phone",
  "barber_display_name",
  "manage_token",
] as const;

export const platformShopDetailSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    status: platformShopStatusSchema,
    created_at: z.string(),
    timezone: z.string(),
    booking_lead_time_min: z.number().int(),
    cancellation_window_min: z.number().int(),
    slot_granularity_min: z.number().int(),
    reminders_enabled: z.boolean(),
    owner_display_name: z.string().nullable().optional(),
    owner_email: z.string().nullable().optional(),
    staff_count: z.number().int(),
    bookings_last_30d: z.number().int(),
    dead_outbox_count: z.number().int(),
    minisite_template: z.string(),
    minisite_accent_hex: z.string(),
    outbox_by_template: z.record(z.record(z.number())).optional(),
    audit_trail: z.array(z.record(z.unknown())).default([]),
  })
  .strict();

export const platformCreateShopInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9](-?[a-z0-9])*$/),
  ownerEmail: z.string().email(),
  timezone: z.string().min(1),
});

export const platformShopTodaySchema = z.object({
  date: z.string(),
  timezone: z.string(),
  total: z.number().int(),
  by_hour: z.array(z.object({ hour: z.number().int(), count: z.number().int() })),
});

export function assertNoForbiddenShopDetailKeys(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN_PLATFORM_SHOP_DETAIL_KEYS) {
    if (key in payload) {
      throw new Error(`forbidden key in platform_get_shop: ${key}`);
    }
  }
}
