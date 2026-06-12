import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";
import type {
  BookAppointmentRpcResult,
  GetBookingByTokenRpcResult,
  RescheduleBookingByTokenRpcResult,
} from "@/types/database-rpc.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

const asBook = (value: unknown) => value as BookAppointmentRpcResult | null;
const asBookingView = (value: unknown) => value as GetBookingByTokenRpcResult | null;
const asReschedule = (value: unknown) => value as RescheduleBookingByTokenRpcResult | null;

const BOOK_SLOT = "2026-07-06T07:00:00.000Z";
const BOOK_SLOT_B = "2026-07-06T08:00:00.000Z";

function anonClient(): Client {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ownerAClient(): Promise<Client> {
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

function uniquePhone(): string {
  const suffix = Math.floor(Math.random() * 9_000_000 + 1_000_000);
  return `+49170${suffix}`;
}

function bookArgs(overrides: Partial<{
  phone: string;
  idempotencyKey: string;
  startsAt: string;
  slug: string;
  email: string | null;
  membershipId: string | null;
  ip: string;
}>) {
  return {
    p_shop_slug: overrides.slug ?? SEED.shops.a.slug,
    p_service_id: SEED.phase2.serviceA,
    p_membership_id: overrides.membershipId ?? SEED.memberships.barberA,
    p_starts_at: overrides.startsAt ?? BOOK_SLOT,
    p_name: "RPC Guest",
    p_phone: overrides.phone ?? uniquePhone(),
    p_email: overrides.email ?? "rpc-guest@glanzo.test",
    p_idempotency_key: overrides.idempotencyKey ?? crypto.randomUUID(),
    p_client_ip: overrides.ip ?? "203.0.113.10",
  };
}

describe("Phase 3 booking + manage RPCs", () => {
  let ownerA: Client;

  beforeAll(async () => {
    ownerA = await ownerAClient();
  });

  it("books with name + phone and returns manage token", async () => {
    const anon = anonClient();
    const { data, error } = await anon.rpc("book_appointment", bookArgs({}));
    expect(error).toBeNull();
    const book = asBook(data);
    expect(book?.manage_token).toBeTruthy();
    expect(book?.id).toBeTruthy();
    expect(book?.idempotent_replay).toBe(false);
  });

  it("replays idempotency key without creating a duplicate appointment", async () => {
    const anon = anonClient();
    const key = crypto.randomUUID();
    const phone = uniquePhone();
    const first = await anon.rpc("book_appointment", bookArgs({ idempotencyKey: key, phone }));
    const second = await anon.rpc("book_appointment", bookArgs({ idempotencyKey: key, phone }));
    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
    expect(asBook(second.data)?.id).toBe(asBook(first.data)?.id);
    expect(asBook(second.data)?.idempotent_replay).toBe(true);
  });

  it("rejects suspended shop with SHOP_SUSPENDED", async () => {
    const anon = anonClient();
    const { error } = await anon.rpc(
      "book_appointment",
      bookArgs({ slug: SEED.shops.b.slug, startsAt: "2026-08-01T07:00:00.000Z" }),
    );
    expect(error?.message ?? "").toMatch(/SHOP_SUSPENDED/i);
  });

  it("rejects fourth active future booking on one phone with PHONE_LIMIT", async () => {
    const anon = anonClient();
    const phone = uniquePhone();
    const slots = [
      "2026-08-04T07:00:00.000Z",
      "2026-08-05T07:00:00.000Z",
      "2026-08-06T07:00:00.000Z",
    ];

    for (const startsAt of slots) {
      const { error } = await anon.rpc(
        "book_appointment",
        bookArgs({ phone, startsAt, idempotencyKey: crypto.randomUUID() }),
      );
      expect(error).toBeNull();
    }

    const { error } = await anon.rpc(
      "book_appointment",
      bookArgs({ phone, startsAt: "2026-08-07T07:00:00.000Z", idempotencyKey: crypto.randomUUID() }),
    );
    expect(error?.message ?? "").toMatch(/PHONE_LIMIT/i);
  });

  it("rejects excessive attempts with RATE_LIMITED", async () => {
    const anon = anonClient();
    const ip = `203.0.113.${Math.floor(Math.random() * 200 + 10)}`;

    for (let i = 0; i < 10; i += 1) {
      await anon.rpc(
        "book_appointment",
        bookArgs({
          ip,
          idempotencyKey: crypto.randomUUID(),
          phone: uniquePhone(),
          startsAt: `2026-09-${String(10 + i).padStart(2, "0")}T07:00:00.000Z`,
        }),
      );
    }

    const { error } = await anon.rpc(
      "book_appointment",
      bookArgs({ ip, idempotencyKey: crypto.randomUUID(), phone: uniquePhone() }),
    );
    expect(error?.message ?? "").toMatch(/RATE_LIMITED/i);
  });

  it("rejects overlapping slot with SLOT_TAKEN", async () => {
    const anon = anonClient();
    const { error } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: "2026-06-15T10:15:00Z",
        membershipId: SEED.memberships.barberA,
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
      }),
    );
    expect(error?.message ?? "").toMatch(/SLOT_TAKEN/i);
  });

  it("writes confirmed + reminder outbox rows when email is present", async () => {
    const anon = anonClient();
    const phone = uniquePhone();
    const { data, error } = await anon.rpc(
      "book_appointment",
      bookArgs({
        phone,
        email: "outbox-test@glanzo.test",
        startsAt: "2026-10-05T07:00:00.000Z",
        idempotencyKey: crypto.randomUUID(),
      }),
    );
    expect(error).toBeNull();

    const { data: rows } = await ownerA
      .from("notification_outbox")
      .select("template, status")
      .eq("appointment_id", asBook(data)?.id as string);

    const templates = (rows ?? []).map((row) => row.template).sort();
    expect(templates).toEqual(["booking_confirmed", "owner_new_booking", "reminder_24h"]);
    expect((rows ?? []).every((row) => row.status === "pending")).toBe(true);
  });

  it("keeps appointment price snapshot when service price changes", async () => {
    const anon = anonClient();
    const { data, error } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: "2026-10-06T07:00:00.000Z",
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
      }),
    );
    expect(error).toBeNull();

    await ownerA
      .from("services")
      .update({ price_cents: 9999 })
      .eq("id", SEED.phase2.serviceA);

    const { data: appointment } = await ownerA
      .from("appointments")
      .select("price_cents, service_name")
      .eq("id", asBook(data)?.id as string)
      .single();

    expect(appointment?.price_cents).toBe(2500);

    await ownerA.from("services").update({ price_cents: 2500 }).eq("id", SEED.phase2.serviceA);
  });

  it("get_booking_by_token returns whitelisted fields only", async () => {
    const anon = anonClient();
    const { data: bookedRaw } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: BOOK_SLOT_B,
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
      }),
    );
    const booked = asBook(bookedRaw);

    const { data, error } = await anon.rpc("get_booking_by_token", {
      p_token: booked?.manage_token as string,
    });
    expect(error).toBeNull();
    const view = asBookingView(data);
    expect(view?.shop_name).toBeTruthy();
    expect(view?.service_name).toBeTruthy();
    expect(view?.barber_display_name).toBeTruthy();
    expect(view?.starts_at).toBeTruthy();
    expect(Object.keys(view ?? {})).not.toContain("manage_token");
  });

  it("reschedule regenerates token and invalidates the old token", async () => {
    const anon = anonClient();
    const { data: bookedRaw } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: "2026-10-07T07:00:00.000Z",
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
      }),
    );
    const booked = asBook(bookedRaw);
    const oldToken = booked?.manage_token as string;

    const { data: rescheduledRaw, error } = await anon.rpc("reschedule_booking_by_token", {
      p_token: oldToken,
      p_new_starts_at: "2026-10-07T08:00:00.000Z",
    });
    expect(error).toBeNull();
    const rescheduled = asReschedule(rescheduledRaw);
    expect(rescheduled?.manage_token).not.toBe(oldToken);

    const oldLookup = await anon.rpc("get_booking_by_token", { p_token: oldToken });
    expect(oldLookup.error?.message ?? "").toMatch(/BOOKING_NOT_FOUND/i);

    const newLookup = await anon.rpc("get_booking_by_token", {
      p_token: rescheduled?.manage_token as string,
    });
    expect(newLookup.error).toBeNull();
  });

  it("cancel inside window returns TOO_LATE", async () => {
    const anon = anonClient();
    const soon = new Date(Date.now() + 30 * 60_000).toISOString();
    const { data: bookedRaw } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: soon,
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
      }),
    );
    const booked = asBook(bookedRaw);

    const { error } = await anon.rpc("cancel_booking_by_token", {
      p_token: booked?.manage_token as string,
    });
    expect(error?.message ?? "").toMatch(/TOO_LATE/i);
  });

  it("cancel succeeds outside window and kills pending reminder outbox row", async () => {
    const anon = anonClient();
    const { data: bookedRaw } = await anon.rpc(
      "book_appointment",
      bookArgs({
        startsAt: "2026-11-10T07:00:00.000Z",
        idempotencyKey: crypto.randomUUID(),
        phone: uniquePhone(),
        email: "cancel-outbox@glanzo.test",
      }),
    );
    const booked = asBook(bookedRaw);

    const { error } = await anon.rpc("cancel_booking_by_token", {
      p_token: booked?.manage_token as string,
    });
    expect(error).toBeNull();

    const { data: rows } = await ownerA
      .from("notification_outbox")
      .select("template, status")
      .eq("appointment_id", booked?.id as string);

    const reminder = rows?.find((row) => row.template === "reminder_24h");
    const cancelled = rows?.find((row) => row.template === "booking_cancelled");
    expect(reminder?.status).toBe("dead");
    expect(cancelled?.status).toBe("pending");
  });
});
