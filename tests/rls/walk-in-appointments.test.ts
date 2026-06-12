import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

async function signIn(email: string, password: string): Promise<Client> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return client;
}

describe("Walk-in appointments (RLS)", () => {
  let ownerA: Client;
  let barberA: Client;

  beforeAll(async () => {
    ownerA = await signIn(SEED.users.ownerA.email, SEED.users.ownerA.password);
    barberA = await signIn(SEED.users.barberA.email, SEED.users.barberA.password);
  });

  it("lets barber insert walk-in for own membership without customer", async () => {
    const { data, error } = await barberA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: null,
      membership_id: SEED.memberships.barberA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2027-06-02T07:00:00.000Z",
      ends_at: "2027-06-02T07:30:00.000Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "walk_in",
      manage_token: `walkin-${crypto.randomUUID().replaceAll("-", "")}`,
    }).select("id").single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
  });

  it("blocks barber walk-in for another membership", async () => {
    const { error } = await barberA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: null,
      membership_id: SEED.memberships.ownerA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2027-06-03T07:00:00.000Z",
      ends_at: "2027-06-03T07:30:00.000Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "walk_in",
      manage_token: `walkin-${crypto.randomUUID().replaceAll("-", "")}`,
    });

    expect(error).toBeTruthy();
  });

  it("lets owner insert walk-in for any staff membership", async () => {
    const { error } = await ownerA.from("appointments").insert({
      shop_id: SEED.shops.a.id,
      customer_id: null,
      membership_id: SEED.memberships.barberA,
      service_id: SEED.phase2.serviceA,
      starts_at: "2027-06-04T07:00:00.000Z",
      ends_at: "2027-06-04T07:30:00.000Z",
      status: "booked",
      service_name: "Classic Cut",
      price_cents: 2500,
      source: "walk_in",
      manage_token: `walkin-${crypto.randomUUID().replaceAll("-", "")}`,
    });

    expect(error).toBeNull();
  });
});
