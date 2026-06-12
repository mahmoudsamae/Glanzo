import "server-only";

import { z } from "zod";

import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { openingHoursSchema } from "@/lib/validations/shop";
import { requireShopOwner } from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

const shopSettingsSchema = z.object({
  openingHours: openingHoursSchema,
  bookingLeadTimeMin: z.number().int().min(0),
  cancellationWindowMin: z.number().int().min(0),
  slotGranularityMin: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30), z.literal(60)]),
});

export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>;

export async function loadShopSettings(actor: Actor, shopId: string) {
  requireShopOwner(actor, shopId);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, slug, opening_hours, booking_lead_time_min, cancellation_window_min, slot_granularity_min",
    )
    .eq("id", shopId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateShopSettings(
  actor: Actor,
  shopId: string,
  input: ShopSettingsInput,
): Promise<{ ok: true } | { ok: false; code: "VALIDATION" | "FORBIDDEN" | "UNKNOWN" }> {
  try {
    requireShopOwner(actor, shopId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = shopSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("shops")
    .update({
      opening_hours: parsed.data.openingHours,
      booking_lead_time_min: parsed.data.bookingLeadTimeMin,
      cancellation_window_min: parsed.data.cancellationWindowMin,
      slot_granularity_min: parsed.data.slotGranularityMin,
    })
    .eq("id", shopId);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  revalidateShopPublic(shopId);
  return { ok: true };
}
