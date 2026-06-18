import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type ShopRow = Database["public"]["Tables"]["shops"]["Row"];

export type PublicShopRow = Pick<
  ShopRow,
  "slug" | "name" | "status" | "timezone" | "opening_hours"
>;

const PUBLIC_SHOP_COLUMNS =
  "slug, name, status, timezone, opening_hours" as const;

/**
 * @deprecated Phase 5 — use `getPublicShopDataBySlug` (RPC + ISR) instead.
 * Retained for tests only; anon direct read was revoked.
 */
export async function getPublicShopBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PublicShopRow | null> {
  const { data, error } = await supabase
    .from("shops")
    .select(PUBLIC_SHOP_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/** Authenticated / service reads — full shop row. */
export async function getShopBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ShopRow | null> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, slug, name, status, timezone, currency, opening_hours, booking_lead_time_min, cancellation_window_min, slot_granularity_min, reminders_enabled, allowed_minisite_templates, created_at, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
