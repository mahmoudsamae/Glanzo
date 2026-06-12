/**
 * Written, not executed by default — requires live Supabase + service role.
 * Proves SKIP LOCKED: two parallel claim_outbox_batch calls must not return the same row id.
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { isSupabaseReachable } from "../lib/supabase-target";
import { SEED, SUPABASE_URL } from "./constants";

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("claim_outbox_batch concurrency", () => {
  it.skipIf(!SERVICE_KEY)("claims disjoint row sets under parallel dispatch", async () => {
    if (!(await isSupabaseReachable())) {
      return;
    }

    const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const due = new Date().toISOString();
    await admin.from("notification_outbox").insert({
      shop_id: SEED.shops.a.id,
      appointment_id: SEED.phase3.appointmentBarberA,
      channel: "email",
      template: "booking_confirmed",
      payload: { to: "concurrency@glanzo.test", appointment_id: SEED.phase3.appointmentBarberA },
      scheduled_for: due,
      status: "pending",
    });

    const [first, second] = await Promise.all([
      admin.rpc("claim_outbox_batch", { p_limit: 5 }),
      admin.rpc("claim_outbox_batch", { p_limit: 5 }),
    ]);

    const idsA = new Set((first.data ?? []).map((row) => row.id));
    const idsB = new Set((second.data ?? []).map((row) => row.id));
    for (const id of idsA) {
      expect(idsB.has(id)).toBe(false);
    }
  });
});
