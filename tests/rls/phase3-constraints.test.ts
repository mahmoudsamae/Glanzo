import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

async function signInOwnerA(): Promise<Client> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: SEED.users.ownerA.email,
    password: SEED.users.ownerA.password,
  });
  if (error) throw new Error(error.message);
  return client;
}

describe("Phase 3 exclusion constraints", () => {
  let ownerA: Client;

  beforeAll(async () => {
    ownerA = await signInOwnerA();
  });

  it("rejects overlapping booked appointments for the same barber", async () => {
    const { error } = await ownerA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: SEED.phase3.customerA,
      membership_id: SEED.memberships.barberA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2026-06-15T10:15:00Z",
      ends_at: "2026-06-15T10:45:00Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "online",
      manage_token: "test-overlap-token-32chars-minimum-len",
    });

    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/exclude|overlap|conflict/i);
  });

  it("allows adjacent appointments (touching boundary)", async () => {
    const { data, error } = await ownerA
      .from("appointments")
      .insert({
        shop_id: SEED.shops.a.id,
        customer_id: SEED.phase3.customerA,
        membership_id: SEED.memberships.barberA,
        service_id: SEED.phase2.serviceA,
        starts_at: "2026-06-15T11:00:00Z",
        ends_at: "2026-06-15T11:30:00Z",
        status: "booked",
        service_name: "Classic Cut",
        price_cents: 2500,
        source: "online",
        manage_token: "test-adjacent-token-32chars-minimum-len",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();

    const { error: secondError } = await ownerA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: SEED.phase3.customerA,
      membership_id: SEED.memberships.barberA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2026-06-15T11:30:00Z",
      ends_at: "2026-06-15T12:00:00Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "online",
      manage_token: "test-adjacent2-token-32chars-minimum-le",
    });

    expect(secondError).toBeNull();
  });

  it("does not block overlaps when an existing appointment is cancelled", async () => {
    const { data: cancelled, error: insertError } = await ownerA
      .from("appointments")
      .insert({
        shop_id: SEED.shops.a.id,
        customer_id: SEED.phase3.customerA,
        membership_id: SEED.memberships.barberA,
        service_id: SEED.phase2.serviceA,
        starts_at: "2026-06-16T09:00:00Z",
        ends_at: "2026-06-16T09:30:00Z",
        status: "cancelled",
        service_name: "Classic Cut",
        price_cents: 2500,
        source: "online",
        manage_token: "test-cancelled-token-32chars-minimum-len",
        cancelled_at: "2026-06-10T09:00:00Z",
      })
      .select("id")
      .single();

    expect(insertError).toBeNull();
    expect(cancelled?.id).toBeTruthy();

    const { error: overlapError } = await ownerA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: SEED.phase3.customerA,
      membership_id: SEED.memberships.barberA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2026-06-16T09:15:00Z",
      ends_at: "2026-06-16T09:45:00Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "online",
      manage_token: "test-over-cancel-token-32chars-minimum-len",
    });

    expect(overlapError).toBeNull();
  });

  it("enforces unique (shop_id, phone) on customers", async () => {
    const { error } = await ownerA.from("customers").insert({
      shop_id: SEED.shops.a.id,
      name: "Duplicate Phone",
      phone: SEED.phase3.customerPhone,
    });

    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/unique|duplicate/i);
  });
});
