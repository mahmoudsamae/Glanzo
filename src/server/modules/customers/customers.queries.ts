import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import type { CustomerListItem, CustomerProfile, CustomerVisitRow } from "./customers.types";

type Client = SupabaseClient<Database>;

export async function listCustomersPage(
  supabase: Client,
  shopId: string,
  options: { search?: string; cursor?: string; limit: number },
): Promise<CustomerListItem[]> {
  let query = supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("shop_id", shopId)
    .order("id", { ascending: false })
    .limit(options.limit);

  if (options.cursor) {
    query = query.lt("id", options.cursor);
  }

  if (options.search) {
    const term = options.search.replace(/[%_]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
    }
  }

  const { data: customers, error } = await query;
  if (error) {
    throw error;
  }

  const ids = (customers ?? []).map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }

  const { data: stats, error: statsError } = await supabase
    .from("appointments")
    .select("customer_id, starts_at, status")
    .eq("shop_id", shopId)
    .in("customer_id", ids)
    .neq("status", "cancelled");

  if (statsError) {
    throw statsError;
  }

  const byCustomer = new Map<string, { count: number; lastVisitAt: string | null }>();
  for (const row of stats ?? []) {
    if (!row.customer_id) {
      continue;
    }
    const current = byCustomer.get(row.customer_id) ?? { count: 0, lastVisitAt: null };
    current.count += 1;
    if (!current.lastVisitAt || row.starts_at > current.lastVisitAt) {
      current.lastVisitAt = row.starts_at;
    }
    byCustomer.set(row.customer_id, current);
  }

  return (customers ?? []).map((row) => {
    const stat = byCustomer.get(row.id);
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      visitsCount: stat?.count ?? 0,
      lastVisitAt: stat?.lastVisitAt ?? null,
    };
  });
}

export async function getCustomerById(
  supabase: Client,
  shopId: string,
  customerId: string,
): Promise<CustomerProfile | null> {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, notes")
    .eq("shop_id", shopId)
    .eq("id", customerId)
    .maybeSingle();

  if (error || !customer) {
    return null;
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, starts_at, service_name, price_cents, status, membership_id")
    .eq("shop_id", shopId)
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false });

  if (appointmentsError) {
    throw appointmentsError;
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, profile:profiles ( display_name )")
    .eq("shop_id", shopId);

  const barberNames = new Map<string, string>();
  for (const row of memberships ?? []) {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    barberNames.set(row.id, profile?.display_name?.trim() || "Staff");
  }

  const visits: CustomerVisitRow[] = (appointments ?? []).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    serviceName: row.service_name,
    barberName: barberNames.get(row.membership_id) ?? "Staff",
    priceCents: row.price_cents,
    status: row.status,
  }));

  const completedVisits = visits.filter((visit) => visit.status !== "cancelled");
  const noShowCount = visits.filter((visit) => visit.status === "no_show").length;
  const totalSpentCents = completedVisits.reduce((sum, visit) => sum + visit.priceCents, 0);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    notes: customer.notes,
    visitsCount: completedVisits.length,
    noShowCount,
    totalSpentCents,
    visits,
  };
}
