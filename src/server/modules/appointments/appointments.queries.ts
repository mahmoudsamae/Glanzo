import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { parseOpeningHours } from "@/lib/validations/shop";
import type { Database } from "@/types/database.types";
import { dayEndMs, dayStartMs } from "@/server/modules/availability/time-windows";

import type { AppointmentListItem, BarberColumn } from "./appointments.types";

type Client = SupabaseClient<Database>;

function mapAppointmentRow(
  row: {
    id: string;
    shop_id: string;
    customer_id: string | null;
    membership_id: string;
    service_id: string;
    starts_at: string;
    ends_at: string;
    status: AppointmentListItem["status"];
    service_name: string;
    price_cents: number;
    source: AppointmentListItem["source"];
    customer: { name: string; phone: string } | null;
  },
): AppointmentListItem {
  return {
    id: row.id,
    shopId: row.shop_id,
    customerId: row.customer_id,
    membershipId: row.membership_id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    serviceName: row.service_name,
    priceCents: row.price_cents,
    source: row.source,
    customerName: row.customer?.name ?? null,
    customerPhone: row.customer?.phone ?? null,
  };
}

export async function listShopBarbers(
  supabase: Client,
  shopId: string,
): Promise<BarberColumn[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select(
      `
      id,
      role,
      profile:profiles ( display_name )
    `,
    )
    .eq("shop_id", shopId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    membershipId: row.id,
    displayName:
      (row.profile as { display_name: string } | null)?.display_name?.trim() || "Staff",
    role: row.role,
  }));
}

export async function listAppointmentsInRange(
  supabase: Client,
  shopId: string,
  rangeStartIso: string,
  rangeEndIso: string,
  membershipId?: string | null,
): Promise<AppointmentListItem[]> {
  let query = supabase
    .from("appointments")
    .select(
      `
      id,
      shop_id,
      customer_id,
      membership_id,
      service_id,
      starts_at,
      ends_at,
      status,
      service_name,
      price_cents,
      source,
      customer:customers ( name, phone )
    `,
    )
    .eq("shop_id", shopId)
    .lt("starts_at", rangeEndIso)
    .gt("ends_at", rangeStartIso)
    .order("starts_at", { ascending: true });

  if (membershipId) {
    query = query.eq("membership_id", membershipId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapAppointmentRow({
      ...row,
      customer: Array.isArray(row.customer) ? row.customer[0] ?? null : row.customer,
    }),
  );
}

export async function getShopCalendarContext(
  supabase: Client,
  shopId: string,
): Promise<{
  timezone: string;
  slotGranularityMin: number;
  openingHours: NonNullable<ReturnType<typeof parseOpeningHours>>;
  slug: string;
} | null> {
  const { data, error } = await supabase
    .from("shops")
    .select("timezone, slot_granularity_min, opening_hours, slug")
    .eq("id", shopId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const openingHours = parseOpeningHours(data.opening_hours);
  if (!openingHours) {
    return null;
  }

  return {
    timezone: data.timezone,
    slotGranularityMin: data.slot_granularity_min,
    openingHours,
    slug: data.slug,
  };
}

export function dayRangeIso(date: string, timezone: string): {
  startIso: string;
  endIso: string;
} {
  return {
    startIso: new Date(dayStartMs(date, timezone)).toISOString(),
    endIso: new Date(dayEndMs(date, timezone)).toISOString(),
  };
}
