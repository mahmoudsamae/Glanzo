/**
 * Written — requires live Supabase. Owner invite acceptance creates owner membership.
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";

import { isSupabaseReachable } from "../lib/supabase-target";
import { SEED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants";

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("platform owner invite", () => {
  it.skipIf(!SERVICE_KEY)("accept_staff_invite honors owner role on invite row", async () => {
    if (!(await isSupabaseReachable())) {
      return;
    }

    const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email = `owner-invite-${crypto.randomUUID()}@glanzo.test`;
    const { data: created, error: createError } = await admin.rpc("platform_create_shop", {
      p_name: "Owner Invite Test",
      p_slug: `owner-test-${crypto.randomUUID().slice(0, 8)}`,
      p_owner_email: email,
      p_timezone: "Europe/Berlin",
    });
    expect(createError).toBeNull();

    const token = (created as { invite_token: string }).invite_token;
    const shopId = (created as { shop_id: string }).shop_id;

    const password = "password123";
    const { data: signUp, error: signUpError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(signUpError).toBeNull();

    const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await userClient.auth.signInWithPassword({ email, password });

    const { data: membership, error: acceptError } = await userClient.rpc("accept_staff_invite", {
      p_token: token,
    });
    expect(acceptError).toBeNull();
    expect(membership?.role).toBe("owner");
    expect(membership?.shop_id).toBe(shopId);

    await admin.auth.admin.deleteUser(signUp.user!.id);
  });
});
