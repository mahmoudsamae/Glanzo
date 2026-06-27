import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export async function listServicesForShop(
  supabase: SupabaseClient<Database>,
  shopId: string,
  options: { includeArchived?: boolean } = {},
): Promise<ServiceRow[]> {
  let query = supabase
    .from("services")
    .select(
      "id, shop_id, name, duration_min, price_cents, show_price, description, image_path, sort_order, archived_at, created_at, updated_at",
    )
    .eq("shop_id", shopId)
    .order("sort_order", { ascending: true });

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getServiceById(
  supabase: SupabaseClient<Database>,
  shopId: string,
  serviceId: string,
): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, shop_id, name, duration_min, price_cents, show_price, description, image_path, sort_order, archived_at, created_at, updated_at",
    )
    .eq("shop_id", shopId)
    .eq("id", serviceId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listServiceStaffMembershipIds(
  supabase: SupabaseClient<Database>,
  shopId: string,
  serviceId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("service_staff")
    .select("membership_id")
    .eq("shop_id", shopId)
    .eq("service_id", serviceId);

  if (error) throw error;
  return (data ?? []).map((row) => row.membership_id);
}
