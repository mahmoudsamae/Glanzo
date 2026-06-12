import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

async function signInClient(email: string, password: string): Promise<Client> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to sign in ${email}: ${error.message}`);
  }

  return client;
}

describe("RLS smoke (real JWT clients)", () => {
  let ownerA: Client;
  let barberA: Client;
  let anon: Client;

  beforeAll(async () => {
    ownerA = await signInClient(SEED.users.ownerA.email, SEED.users.ownerA.password);
    barberA = await signInClient(SEED.users.barberA.email, SEED.users.barberA.password);
    anon = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  it("owner A reads own shop", async () => {
    const { data, error } = await ownerA
      .from("shops")
      .select("id, slug")
      .eq("slug", SEED.shops.a.slug);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.slug).toBe(SEED.shops.a.slug);
  });

  it("owner A cannot SELECT shop B", async () => {
    const { data, error } = await ownerA
      .from("shops")
      .select("id")
      .eq("slug", SEED.shops.b.slug);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("owner A cannot UPDATE shop B", async () => {
    const { data, error } = await ownerA
      .from("shops")
      .update({ name: "Hacked" })
      .eq("id", SEED.shops.b.id)
      .select("id");

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("owner A cannot read shop B memberships", async () => {
    const { data, error } = await ownerA
      .from("memberships")
      .select("id")
      .eq("shop_id", SEED.shops.b.id);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("owner A cannot read shop B audit logs", async () => {
    const { data, error } = await ownerA
      .from("audit_logs")
      .select("id")
      .eq("shop_id", SEED.shops.b.id);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("barber on shop A reads shop A", async () => {
    const { data, error } = await barberA
      .from("shops")
      .select("slug")
      .eq("slug", SEED.shops.a.slug);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("barber on shop A cannot UPDATE shop A", async () => {
    const { data, error } = await barberA
      .from("shops")
      .update({ name: "Barber edit" })
      .eq("id", SEED.shops.a.id)
      .select("id");

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("barber on shop A cannot read audit_logs", async () => {
    const { data, error } = await barberA.from("audit_logs").select("id");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anon client reads zero rows from every table", async () => {
    const tables = ["shops", "profiles", "memberships", "platform_admins", "audit_logs"] as const;

    for (const table of tables) {
      const { data, error } = await anon.from(table).select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    }
  });

  it("owner A cannot UPDATE own shop status", async () => {
    const { error } = await ownerA
      .from("shops")
      .update({ status: "suspended" })
      .eq("id", SEED.shops.a.id);

    expect(error?.message ?? "").toMatch(/service role may change shop status/i);
  });

  it("owner A cannot change own slug", async () => {
    const { error } = await ownerA
      .from("shops")
      .update({ slug: "new-slug" })
      .eq("id", SEED.shops.a.id);

    expect(error?.message ?? "").toMatch(/slug is immutable/i);
  });

  it("owner A audit_logs UPDATE fails (privilege revoked)", async () => {
    const { error } = await ownerA
      .from("audit_logs")
      .update({ action: "tampered" })
      .eq("shop_id", SEED.shops.a.id);

    expect(error).not.toBeNull();
  });

  it("owner A audit_logs DELETE fails (privilege revoked)", async () => {
    const { error } = await ownerA
      .from("audit_logs")
      .delete()
      .eq("shop_id", SEED.shops.a.id);

    expect(error).not.toBeNull();
  });
});
