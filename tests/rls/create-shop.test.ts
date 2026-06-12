import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";
import type { Database } from "@/types/database.types";

import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

type Client = SupabaseClient<Database>;

async function signInClient(email: string, password: string): Promise<Client> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to sign in ${email}: ${error.message}`);
  }

  return client;
}

async function signUpFreshOwner(): Promise<{ client: Client; userId: string; slug: string }> {
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `owner-${suffix}@glanzo.test`;
  const password = "password123";
  const slug = `test-shop-${suffix}`;

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: `Owner ${suffix}` } },
  });

  if (error || !data.user) {
    throw new Error(`Failed to sign up ${email}: ${error?.message ?? "no user"}`);
  }

  return { client, userId: data.user.id, slug };
}

describe("create_shop_with_owner RPC (atomicity + RLS)", () => {
  let ownerB: Client;
  let anon: Client;

  beforeAll(async () => {
    ownerB = await signInClient(SEED.users.ownerB.email, SEED.users.ownerB.password);
    anon = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  it("authenticated user creates shop with membership and audit row", async () => {
    const { client, slug } = await signUpFreshOwner();

    const { data: shop, error } = await client.rpc("create_shop_with_owner", {
      p_name: "Fresh Shop",
      p_slug: slug,
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });

    expect(error).toBeNull();
    expect(shop?.slug).toBe(slug);

    const { data: memberships } = await client
      .from("memberships")
      .select("role, shop_id")
      .eq("shop_id", shop!.id);

    expect(memberships).toHaveLength(1);
    expect(memberships?.[0]?.role).toBe("owner");

    const { data: audits } = await client
      .from("audit_logs")
      .select("action, entity, diff")
      .eq("shop_id", shop!.id);

    expect(audits).toHaveLength(1);
    expect(audits?.[0]?.action).toBe("shop.created");
    expect(audits?.[0]?.entity).toBe("shop");
  });

  it("duplicate slug leaves zero rows from the failed attempt", async () => {
    const firstOwner = await signUpFreshOwner();
    const secondOwner = await signUpFreshOwner();

    const first = await firstOwner.client.rpc("create_shop_with_owner", {
      p_name: "First",
      p_slug: firstOwner.slug,
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });
    expect(first.error).toBeNull();

    const { count: shopsBefore } = await secondOwner.client
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("slug", firstOwner.slug);

    const second = await secondOwner.client.rpc("create_shop_with_owner", {
      p_name: "Second",
      p_slug: firstOwner.slug,
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });

    expect(second.error?.message.toUpperCase()).toContain("SLUG_TAKEN");

    const { count: shopsAfter } = await secondOwner.client
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("slug", firstOwner.slug);

    expect(shopsAfter).toBe(shopsBefore);

    const { count: secondMemberships } = await secondOwner.client
      .from("memberships")
      .select("id", { count: "exact", head: true });

    expect(secondMemberships).toBe(0);
  });

  it("anon cannot call create_shop_with_owner", async () => {
    const { error } = await anon.rpc("create_shop_with_owner", {
      p_name: "Anon Shop",
      p_slug: "anon-shop-test",
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });

    expect(error).not.toBeNull();
  });

  it("owner can read new shop; other seeded owner cannot", async () => {
    const { client, slug } = await signUpFreshOwner();

    const created = await client.rpc("create_shop_with_owner", {
      p_name: "Readable Shop",
      p_slug: slug,
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });
    expect(created.error).toBeNull();

    const { data: ownRows } = await client.from("shops").select("slug").eq("slug", slug);
    expect(ownRows).toHaveLength(1);

    const { data: otherRows } = await ownerB.from("shops").select("slug").eq("slug", slug);
    expect(otherRows).toHaveLength(0);
  });

  it("reserved slug rejected server-side", async () => {
    const { client } = await signUpFreshOwner();

    const { error } = await client.rpc("create_shop_with_owner", {
      p_name: "Admin Shop",
      p_slug: "admin",
      p_timezone: "Europe/Berlin",
      p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
    });

    expect(error?.message.toUpperCase()).toContain("SLUG_RESERVED");
  });
});
