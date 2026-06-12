import "server-only";

import type { PublicApiAlternativeSlot } from "@/lib/api/public-response";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  computeAvailabilitySlots,
  type AvailabilitySlot,
} from "@/server/modules/availability";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";

import {
  getServiceForShop,
  getShopSchedulingContextBySlug,
  loadBarberAvailabilityInputs,
} from "./booking.queries";

export type AvailabilityServiceResult =
  | { ok: true; slots: PublicApiAlternativeSlot[] }
  | { ok: false; code: "SHOP_NOT_FOUND" | "SHOP_SUSPENDED" | "INVALID_INPUT" };

function serializeSlots(slots: AvailabilitySlot[]): PublicApiAlternativeSlot[] {
  return slots.map((slot) => ({
    membershipId: slot.membershipId,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
  }));
}

export async function fetchAvailabilityForShop(input: {
  slug: string;
  serviceId: string;
  date: string;
  membershipId?: string | null;
  now?: Date;
}): Promise<AvailabilityServiceResult> {
  const supabase = createServiceRoleClient();
  const shop = await getShopSchedulingContextBySlug(supabase, input.slug);

  if (!shop) {
    return { ok: false, code: "SHOP_NOT_FOUND" };
  }

  if (shop.status !== "active") {
    return { ok: false, code: "SHOP_SUSPENDED" };
  }

  const service = await getServiceForShop(supabase, shop.id, input.serviceId);
  if (!service) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const barbers = await loadBarberAvailabilityInputs(
    supabase,
    shop,
    input.serviceId,
    input.date,
    input.membershipId,
  );

  if (barbers.length === 0) {
    return { ok: true, slots: [] };
  }

  const slots = computeAvailabilitySlots({
    timezone: shop.timezone,
    date: input.date,
    serviceDurationMin: service.durationMin,
    bookingLeadTimeMin: shop.bookingLeadTimeMin,
    slotGranularityMin: shop.slotGranularityMin,
    openingHours: shop.openingHours,
    now: input.now ?? new Date(),
    barbers,
    membershipId: input.membershipId ?? null,
  });

  return { ok: true, slots: serializeSlots(slots) };
}

export async function fetchAvailabilityNearSlot(input: {
  slug: string;
  serviceId: string;
  requestedStartsAt: Date;
  membershipId?: string | null;
}): Promise<PublicApiAlternativeSlot[]> {
  const date = await resolveShopDateForInstant(input.slug, input.requestedStartsAt);
  if (!date) {
    return [];
  }

  const result = await fetchAvailabilityForShop({
    slug: input.slug,
    serviceId: input.serviceId,
    date,
    membershipId: input.membershipId,
  });

  return result.ok ? result.slots : [];
}

async function resolveShopDateForInstant(
  slug: string,
  instant: Date,
): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const shop = await getShopSchedulingContextBySlug(supabase, slug);
  if (!shop) {
    return null;
  }
  return dateInShopTimezone(instant, shop.timezone);
}

export function slotsToAvailabilityModels(slots: PublicApiAlternativeSlot[]): AvailabilitySlot[] {
  return slots.map((slot) => ({
    membershipId: slot.membershipId,
    startsAt: new Date(slot.startsAt),
    endsAt: new Date(slot.endsAt),
  }));
}
