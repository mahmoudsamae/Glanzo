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

async function signUpFreshBarber(): Promise<{ client: Client; email: string }> {
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `invite-barber-${suffix}@glanzo.test`;
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signUp({
    email,
    password: "password123",
    options: { data: { display_name: `Invite ${suffix}` } },
  });
  if (error) throw new Error(error.message);
  return { client, email };
}

describe("accept_staff_invite RPC", () => {
  let ownerA: Client;

  beforeAll(async () => {
    ownerA = await signIn(SEED.users.ownerA.email, SEED.users.ownerA.password);
  });

  it("accepts a valid invite and creates membership atomically", async () => {
    const token = `test-invite-valid-${crypto.randomUUID().replace(/-/g, "")}`;
    const { client, email } = await signUpFreshBarber();

    const { error: insertError } = await ownerA.from("staff_invites").insert({
      shop_id: SEED.shops.a.id,
      email,
      role: "barber",
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: SEED.users.ownerA.id,
    });
    expect(insertError).toBeNull();

    const { data, error } = await client.rpc("accept_staff_invite", { p_token: token });
    expect(error).toBeNull();
    expect(data?.shop_id).toBe(SEED.shops.a.id);
    expect(data?.role).toBe("barber");

    const { data: inviteRow } = await ownerA
      .from("staff_invites")
      .select("accepted_at")
      .eq("token", token)
      .single();
    expect(inviteRow?.accepted_at).toBeTruthy();
  });

  it("rejects expired invite", async () => {
    const token = `test-invite-expired-${crypto.randomUUID().replace(/-/g, "")}`;
    const { client, email } = await signUpFreshBarber();

    await ownerA.from("staff_invites").insert({
      shop_id: SEED.shops.a.id,
      email,
      role: "barber",
      token,
      expires_at: new Date(Date.now() - 60_000).toISOString(),
      created_by: SEED.users.ownerA.id,
    });

    const { error } = await client.rpc("accept_staff_invite", { p_token: token });
    expect(error?.message ?? "").toMatch(/INVITE_EXPIRED/i);
  });

  it("rejects reused invite token", async () => {
    const token = `test-invite-reused-${crypto.randomUUID().replace(/-/g, "")}`;
    const first = await signUpFreshBarber();
    const second = await signUpFreshBarber();

    await ownerA.from("staff_invites").insert({
      shop_id: SEED.shops.a.id,
      email: first.email,
      role: "barber",
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: SEED.users.ownerA.id,
    });

    await first.client.rpc("accept_staff_invite", { p_token: token });
    const { error } = await second.client.rpc("accept_staff_invite", { p_token: token });
    expect(error?.message ?? "").toMatch(/INVITE_INVALID/i);
  });

  it("rejects when user is already a member", async () => {
    const barberA = await signIn(SEED.users.barberA.email, SEED.users.barberA.password);
    const { error } = await barberA.rpc("accept_staff_invite", {
      p_token: SEED.phase2.inviteShopA.token,
    });
    expect(error?.message ?? "").toMatch(/ALREADY_MEMBER/i);
  });
});
