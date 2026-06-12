import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type StaffInviteRow = Database["public"]["Tables"]["staff_invites"]["Row"];
export type StaffHoursRow = Database["public"]["Tables"]["staff_hours"]["Row"];
export type TimeOffRow = Database["public"]["Tables"]["time_off"]["Row"];

export async function listShopMemberships(
  supabase: SupabaseClient<Database>,
  shopId: string,
) {
  const { data, error } = await supabase
    .from("memberships")
    .select(
      `
      id,
      role,
      created_at,
      profile:profiles (
        id,
        display_name,
        avatar_url
      )
    `,
    )
    .eq("shop_id", shopId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listPendingInvites(
  supabase: SupabaseClient<Database>,
  shopId: string,
): Promise<StaffInviteRow[]> {
  const { data, error } = await supabase
    .from("staff_invites")
    .select(
      "id, shop_id, email, role, token, expires_at, accepted_at, created_at, updated_at, created_by",
    )
    .eq("shop_id", shopId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listStaffHours(
  supabase: SupabaseClient<Database>,
  shopId: string,
  membershipId: string,
): Promise<StaffHoursRow[]> {
  const { data, error } = await supabase
    .from("staff_hours")
    .select("id, shop_id, membership_id, weekday, start_time, end_time, created_at, updated_at")
    .eq("shop_id", shopId)
    .eq("membership_id", membershipId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listTimeOff(
  supabase: SupabaseClient<Database>,
  shopId: string,
  membershipId: string,
): Promise<TimeOffRow[]> {
  const { data, error } = await supabase
    .from("time_off")
    .select("id, shop_id, membership_id, starts_at, ends_at, note, created_at")
    .eq("shop_id", shopId)
    .eq("membership_id", membershipId)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getInviteByToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<(StaffInviteRow & { shop: { name: string; slug: string } | null }) | null> {
  const { data, error } = await supabase
    .from("staff_invites")
    .select(
      `
      id,
      shop_id,
      email,
      role,
      token,
      expires_at,
      accepted_at,
      created_at,
      updated_at,
      created_by,
      shop:shops ( name, slug )
    `,
    )
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data;
}
