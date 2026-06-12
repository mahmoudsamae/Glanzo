import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loadDevBookingFixtures(shopId: string): Promise<{
  serviceId: string;
  membershipId: string;
} | null> {
  const supabase = await createServerSupabaseClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id")
    .eq("shop_id", shopId)
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (serviceError || !service) {
    return null;
  }

  const { data: link, error: linkError } = await supabase
    .from("service_staff")
    .select("membership_id")
    .eq("shop_id", shopId)
    .eq("service_id", service.id)
    .limit(1)
    .maybeSingle();

  if (linkError || !link) {
    return null;
  }

  return { serviceId: service.id, membershipId: link.membership_id };
}
