import type { SupabaseClient } from "@supabase/supabase-js";

import { parseOpeningHours } from "@/lib/validations/shop";
import type { Database } from "@/types/database.types";

import type {
  AppointmentBlock,
  BarberAvailabilityInput,
  StaffHourRow,
  TimeOffBlock,
} from "@/server/modules/availability";
import { dayEndMs, dayStartMs } from "@/server/modules/availability/time-windows";

export type ShopSchedulingContext = {
  id: string;
  slug: string;
  status: Database["public"]["Enums"]["shop_status"];
  timezone: string;
  openingHours: NonNullable<ReturnType<typeof parseOpeningHours>>;
  bookingLeadTimeMin: number;
  slotGranularityMin: number;
};

export async function getShopSchedulingContextBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ShopSchedulingContext | null> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, slug, status, timezone, opening_hours, booking_lead_time_min, slot_granularity_min",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const openingHours = parseOpeningHours(data.opening_hours);
  if (!openingHours) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    status: data.status,
    timezone: data.timezone,
    openingHours,
    bookingLeadTimeMin: data.booking_lead_time_min,
    slotGranularityMin: data.slot_granularity_min,
  };
}

export async function getServiceForShop(
  supabase: SupabaseClient<Database>,
  shopId: string,
  serviceId: string,
): Promise<{ id: string; durationMin: number } | null> {
  const { data, error } = await supabase
    .from("services")
    .select("id, duration_min")
    .eq("shop_id", shopId)
    .eq("id", serviceId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  return { id: data.id, durationMin: data.duration_min };
}

export async function listServiceMembershipIds(
  supabase: SupabaseClient<Database>,
  shopId: string,
  serviceId: string,
  membershipId?: string | null,
): Promise<string[]> {
  const { data: links, error } = await supabase
    .from("service_staff")
    .select("membership_id")
    .eq("shop_id", shopId)
    .eq("service_id", serviceId);

  if (error) {
    throw error;
  }

  const linkedIds = (links ?? []).map((row) => row.membership_id);
  let membershipFilterIds = linkedIds;

  if (membershipFilterIds.length === 0) {
    const { data: allMembers, error: allMembersError } = await supabase
      .from("memberships")
      .select("id")
      .eq("shop_id", shopId)
      .is("archived_at", null);

    if (allMembersError) {
      throw allMembersError;
    }

    membershipFilterIds = (allMembers ?? []).map((row) => row.id);
  }

  if (membershipFilterIds.length === 0) {
    return [];
  }

  const { data: members, error: membersError } = await supabase
    .from("memberships")
    .select("id")
    .eq("shop_id", shopId)
    .in("id", membershipFilterIds)
    .is("archived_at", null);

  if (membersError) {
    throw membersError;
  }

  let activeIds = (members ?? []).map((row) => row.id);
  if (membershipId) {
    activeIds = activeIds.filter((id) => id === membershipId);
  }
  return activeIds;
}

async function listStaffHoursForMemberships(
  supabase: SupabaseClient<Database>,
  shopId: string,
  membershipIds: string[],
): Promise<Map<string, StaffHourRow[]>> {
  const map = new Map<string, StaffHourRow[]>();
  if (membershipIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("staff_hours")
    .select("membership_id, weekday, start_time, end_time")
    .eq("shop_id", shopId)
    .in("membership_id", membershipIds);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const hours = map.get(row.membership_id) ?? [];
    hours.push({
      weekday: row.weekday,
      startTime: row.start_time,
      endTime: row.end_time,
    });
    map.set(row.membership_id, hours);
  }

  return map;
}

async function listTimeOffForMemberships(
  supabase: SupabaseClient<Database>,
  shopId: string,
  membershipIds: string[],
  dayStartIso: string,
  dayEndIso: string,
): Promise<Map<string, TimeOffBlock[]>> {
  const map = new Map<string, TimeOffBlock[]>();
  if (membershipIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("time_off")
    .select("membership_id, starts_at, ends_at")
    .eq("shop_id", shopId)
    .in("membership_id", membershipIds)
    .lt("starts_at", dayEndIso)
    .gt("ends_at", dayStartIso);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const blocks = map.get(row.membership_id) ?? [];
    blocks.push({
      startsAt: new Date(row.starts_at),
      endsAt: new Date(row.ends_at),
    });
    map.set(row.membership_id, blocks);
  }

  return map;
}

async function listAppointmentsForMemberships(
  supabase: SupabaseClient<Database>,
  shopId: string,
  membershipIds: string[],
  dayStartIso: string,
  dayEndIso: string,
): Promise<Map<string, AppointmentBlock[]>> {
  const map = new Map<string, AppointmentBlock[]>();
  if (membershipIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("membership_id, starts_at, ends_at, status")
    .eq("shop_id", shopId)
    .in("membership_id", membershipIds)
    .lt("starts_at", dayEndIso)
    .gt("ends_at", dayStartIso);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const appointments = map.get(row.membership_id) ?? [];
    appointments.push({
      membershipId: row.membership_id,
      startsAt: new Date(row.starts_at),
      endsAt: new Date(row.ends_at),
      status: row.status,
    });
    map.set(row.membership_id, appointments);
  }

  return map;
}

export async function getAppointmentSchedulingContextByToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<{
  shopSlug: string;
  serviceId: string;
  membershipId: string;
} | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select("service_id, membership_id, shop:shops(slug)")
    .eq("manage_token", token)
    .maybeSingle();

  if (error) {
    throw error;
  }
  const shop = data?.shop;
  if (!shop || Array.isArray(shop)) {
    return null;
  }

  return {
    shopSlug: shop.slug,
    serviceId: data.service_id,
    membershipId: data.membership_id,
  };
}

export async function loadBarberAvailabilityInputs(
  supabase: SupabaseClient<Database>,
  shop: ShopSchedulingContext,
  serviceId: string,
  date: string,
  membershipId?: string | null,
): Promise<BarberAvailabilityInput[]> {
  const membershipIds = await listServiceMembershipIds(
    supabase,
    shop.id,
    serviceId,
    membershipId,
  );

  const dayStartIso = new Date(dayStartMs(date, shop.timezone)).toISOString();
  const dayEndIso = new Date(dayEndMs(date, shop.timezone)).toISOString();

  const [hoursByMember, timeOffByMember, appointmentsByMember] = await Promise.all([
    listStaffHoursForMemberships(supabase, shop.id, membershipIds),
    listTimeOffForMemberships(supabase, shop.id, membershipIds, dayStartIso, dayEndIso),
    listAppointmentsForMemberships(supabase, shop.id, membershipIds, dayStartIso, dayEndIso),
  ]);

  return membershipIds.map((id) => ({
    membershipId: id,
    staffHours: hoursByMember.get(id) ?? [],
    timeOff: timeOffByMember.get(id) ?? [],
    appointments: appointmentsByMember.get(id) ?? [],
  }));
}
