import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { dispatchNotificationBatch, processOutboxRow } from "@/server/modules/notifications/notifications.service";
import type { EmailAdapter } from "@/server/integrations/resend";
import type { Database } from "@/types/database.types";
import type { BookAppointmentRpcResult } from "@/types/database-rpc.types";

import { isSupabaseReachable } from "../lib/supabase-target";
import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "../rls/constants";

type Client = SupabaseClient<Database>;

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEV_EMAILS = path.join(process.cwd(), ".dev-emails");

function anonClient(): Client {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function serviceClient(): Client {
  if (!SERVICE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required");
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function uniquePhone(): string {
  const suffix = Math.floor(Math.random() * 9_000_000 + 1_000_000);
  return `+49179${suffix}`;
}

async function bookWithEmail(email: string): Promise<BookAppointmentRpcResult> {
  const anon = anonClient();
  const { data, error } = await anon.rpc("book_appointment", {
    p_shop_slug: SEED.shops.a.slug,
    p_service_id: SEED.phase2.serviceA,
    p_membership_id: SEED.memberships.barberA,
    p_starts_at: "2026-12-01T09:00:00.000Z",
    p_name: "Dispatch Guest",
    p_phone: uniquePhone(),
    p_email: email,
    p_idempotency_key: crypto.randomUUID(),
    p_client_ip: "203.0.113.50",
  });
  if (error) {
    throw new Error(error.message);
  }
  return data as BookAppointmentRpcResult;
}

describe("notifications dispatch integration", () => {
  let admin: Client | null = null;

  beforeAll(async () => {
    if (!SERVICE_KEY || !(await isSupabaseReachable())) {
      return;
    }
    admin = serviceClient();
  });

  function requireAdmin(skip: () => void): Client {
    if (!SERVICE_KEY || !admin) {
      skip();
      throw new Error("unreachable");
    }
    return admin;
  }

  afterEach(async () => {
    if (!admin) return;
    await admin.from("shops").update({ reminders_enabled: true }).eq("id", SEED.shops.a.id);
  });

  it("books → dispatch writes confirmation + owner emails to .dev-emails", async ({ skip }) => {
    const db = requireAdmin(skip);
    const email = `dispatch-${crypto.randomUUID()}@glanzo.test`;
    const booked = await bookWithEmail(email);

    const result = await dispatchNotificationBatch();
    expect(result.sent).toBeGreaterThanOrEqual(2);

    const files = await fs.readdir(DEV_EMAILS);
    expect(files.length).toBeGreaterThan(0);

    const contents = await Promise.all(
      files.map((file) => fs.readFile(path.join(DEV_EMAILS, file), "utf8")),
    );
    const joined = contents.join("\n");
    expect(joined).toContain("Gebucht.");
    expect(joined).toContain("Neue Buchung.");
    expect(joined).toContain(email);
    expect(joined).toContain(SEED.users.ownerA.email);

    const { data: rows } = await db
      .from("notification_outbox")
      .select("template, status")
      .eq("appointment_id", booked.id);

    const sentTemplates = (rows ?? [])
      .filter((row) => row.status === "sent")
      .map((row) => row.template);
    expect(sentTemplates).toContain("booking_confirmed");
    expect(sentTemplates).toContain("owner_new_booking");
  });

  it("skips reminder when reminders_enabled is false", async ({ skip }) => {
    const db = requireAdmin(skip);
    await db.from("shops").update({ reminders_enabled: false }).eq("id", SEED.shops.a.id);

    const email = `reminder-off-${crypto.randomUUID()}@glanzo.test`;
    const booked = await bookWithEmail(email);

    const { data: reminder } = await db
      .from("notification_outbox")
      .select("*")
      .eq("appointment_id", booked.id as string)
      .eq("template", "reminder_24h")
      .single();

    await db
      .from("notification_outbox")
      .update({ scheduled_for: new Date().toISOString() })
      .eq("id", reminder!.id);

    const result = await dispatchNotificationBatch();
    expect(result.skipped).toBeGreaterThanOrEqual(1);

    const { data: updated } = await db
      .from("notification_outbox")
      .select("status, last_error")
      .eq("id", reminder!.id)
      .single();

    expect(updated?.status).toBe("skipped");
    expect(updated?.last_error).toContain("reminders_disabled");
  });

  it("skips reminder when appointment is no longer booked", async ({ skip }) => {
    const db = requireAdmin(skip);
    const email = `cancel-skip-${crypto.randomUUID()}@glanzo.test`;
    const booked = await bookWithEmail(email);

    const { data: reminder } = await db
      .from("notification_outbox")
      .select("*")
      .eq("appointment_id", booked.id as string)
      .eq("template", "reminder_24h")
      .single();

    await db
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", booked.id);

    await db
      .from("notification_outbox")
      .update({ status: "pending", scheduled_for: new Date().toISOString(), claimed_at: null })
      .eq("id", reminder!.id);

    await dispatchNotificationBatch();

    const { data: updated } = await db
      .from("notification_outbox")
      .select("status, last_error")
      .eq("id", reminder!.id)
      .single();

    expect(updated?.status).toBe("skipped");
    expect(updated?.last_error).toContain("appointment_cancelled");
  });

  it("marks dead after fifth failed attempt", async ({ skip }) => {
    const db = requireAdmin(skip);
    const failingAdapter: EmailAdapter = async () => ({
      ok: false,
      code: "TEST_FAIL",
      message: "simulated_provider_error",
    });

    const email = `dead-letter-${crypto.randomUUID()}@glanzo.test`;
    const booked = await bookWithEmail(email);

    const { data: row } = await db
      .from("notification_outbox")
      .select("*")
      .eq("appointment_id", booked.id as string)
      .eq("template", "booking_confirmed")
      .single();

    await db
      .from("notification_outbox")
      .update({
        attempts: 4,
        status: "pending",
        scheduled_for: new Date().toISOString(),
        claimed_at: null,
      })
      .eq("id", row!.id);

    const { data: claimed } = await db.rpc("claim_outbox_batch", { p_limit: 1 });
    const claimedRow = claimed?.find((item) => item.id === row!.id);
    expect(claimedRow?.attempts).toBe(5);

    const outcome = await processOutboxRow(claimedRow!, failingAdapter);
    expect(outcome).toBe("dead");

    const { data: updated } = await db
      .from("notification_outbox")
      .select("status, last_error")
      .eq("id", row!.id)
      .single();

    expect(updated?.status).toBe("dead");
    expect(updated?.last_error).toContain("simulated_provider_error");
  });

  it("reclaims stale claimed rows after crash window", async ({ skip }) => {
    const db = requireAdmin(skip);
    const email = `reclaim-${crypto.randomUUID()}@glanzo.test`;
    const booked = await bookWithEmail(email);

    const { data: row } = await db
      .from("notification_outbox")
      .select("*")
      .eq("appointment_id", booked.id as string)
      .eq("template", "booking_confirmed")
      .single();

    const stale = new Date(Date.now() - 6 * 60_000).toISOString();
    await db
      .from("notification_outbox")
      .update({
        status: "pending",
        attempts: 1,
        claimed_at: stale,
        scheduled_for: new Date().toISOString(),
      })
      .eq("id", row!.id);

    const { data: reclaimed } = await db.rpc("claim_outbox_batch", { p_limit: 5 });
    const match = reclaimed?.find((item) => item.id === row!.id);
    expect(match?.attempts).toBe(2);
  });
});
