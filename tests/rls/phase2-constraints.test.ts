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

describe("Phase 2 exclusion constraints", () => {
  let ownerA: Client;

  beforeAll(async () => {
    ownerA = await signInOwnerA();
  });

  it("rejects overlapping staff_hours shifts for the same membership and weekday", async () => {
    const { error } = await ownerA.from("staff_hours").insert({
      shop_id: SEED.shops.a.id,
      membership_id: SEED.memberships.barberA,
      weekday: 0,
      start_time: "12:00",
      end_time: "14:00",
    });

    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/exclude|overlap|conflict/i);
  });

  it("allows adjacent staff_hours shifts (touching boundary)", async () => {
    const { data, error } = await ownerA
      .from("staff_hours")
      .insert({
        shop_id: SEED.shops.a.id,
        membership_id: SEED.memberships.barberA,
        weekday: 1,
        start_time: "09:00",
        end_time: "13:00",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();

    const { error: secondError } = await ownerA.from("staff_hours").insert({
      shop_id: SEED.shops.a.id,
      membership_id: SEED.memberships.barberA,
      weekday: 1,
      start_time: "13:00",
      end_time: "17:00",
    });

    expect(secondError).toBeNull();
  });

  it("rejects overlapping time_off blocks for the same membership", async () => {
    const { error } = await ownerA.from("time_off").insert({
      shop_id: SEED.shops.a.id,
      membership_id: SEED.memberships.barberA,
      starts_at: "2026-08-02T00:00:00Z",
      ends_at: "2026-08-05T00:00:00Z",
    });

    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/exclude|overlap|conflict/i);
  });
});
