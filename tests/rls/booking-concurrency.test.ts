import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

function anonClient(): Client {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function uniquePhone(): string {
  const suffix = Math.floor(Math.random() * 9_000_000 + 1_000_000);
  return `+49171${suffix}`;
}

describe("book_appointment concurrency", () => {
  it("allows exactly one winner for 20 parallel bookings on the same slot", async () => {
    const contestedSlot = "2026-12-01T07:00:00.000Z";
    const pairs = Array.from({ length: 20 }, (_, index) => {
      const anon = anonClient();
      return anon.rpc("book_appointment", {
        p_shop_slug: SEED.shops.a.slug,
        p_service_id: SEED.phase2.serviceA,
        p_membership_id: SEED.memberships.barberA,
        p_starts_at: contestedSlot,
        p_name: "Race Guest",
        p_phone: uniquePhone(),
        p_email: null,
        p_idempotency_key: `race-${index}-${crypto.randomUUID()}`,
        p_client_ip: `198.51.100.${index + 1}`,
      });
    });

    const results = await Promise.all(pairs);
    const successes = results.filter((result) => !result.error);
    const slotTaken = results.filter((result) =>
      /SLOT_TAKEN/i.test(result.error?.message ?? ""),
    );

    expect(successes).toHaveLength(1);
    expect(slotTaken.length).toBe(19);
  });
});
