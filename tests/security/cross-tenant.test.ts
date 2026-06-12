import { beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";

import { SEED } from "./constants";
import {
  MATRIX_ASSERTIONS,
  matrixDimensions,
  signUpFreshOwner,
  type SecurityContext,
} from "./matrix";
import {
  anonClient,
  signInClient,
} from "./supabase-env";

describe("cross-tenant security matrix", () => {
  let ctx: SecurityContext;

  beforeAll(async () => {
    ctx = {
      clients: {
        ownerA: await signInClient(SEED.users.ownerA.email, SEED.users.ownerA.password),
        ownerB: await signInClient(SEED.users.ownerB.email, SEED.users.ownerB.password),
        barberA: await signInClient(SEED.users.barberA.email, SEED.users.barberA.password),
        platformAdmin: await signInClient(
          SEED.users.platformAdmin.email,
          SEED.users.platformAdmin.password,
        ),
        anon: anonClient(),
      },
    };
  });

  it(`registry covers ${matrixDimensions().assertions} named assertions`, () => {
    expect(matrixDimensions().assertions).toBeGreaterThanOrEqual(58);
  });

  for (const assertion of MATRIX_ASSERTIONS) {
    it(assertion.id, async () => {
      await assertion.run(ctx);
    });
  }

  describe("RPC create_shop_with_owner atomicity", () => {
    it("RPC duplicate slug → SLUG_TAKEN, zero orphan rows", async () => {
      const first = await signUpFreshOwner();
      const second = await signUpFreshOwner();

      const created = await first.client.rpc("create_shop_with_owner", {
        p_name: "First Shop",
        p_slug: first.slug,
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });
      expect(created.error).toBeNull();

      const before = await second.client
        .from("shops")
        .select("id", { count: "exact", head: true })
        .eq("slug", first.slug);

      const duplicate = await second.client.rpc("create_shop_with_owner", {
        p_name: "Second Shop",
        p_slug: first.slug,
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });

      expect(duplicate.error?.message.toUpperCase()).toContain("SLUG_TAKEN");

      const after = await second.client
        .from("shops")
        .select("id", { count: "exact", head: true })
        .eq("slug", first.slug);

      expect(after.count).toBe(before.count);

      const { count: membershipCount } = await second.client
        .from("memberships")
        .select("id", { count: "exact", head: true });

      expect(membershipCount).toBe(0);
    });

    it("RPC reserved slug → SLUG_RESERVED", async () => {
      const { client } = await signUpFreshOwner();
      const { error } = await client.rpc("create_shop_with_owner", {
        p_name: "Bad",
        p_slug: "admin",
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });
      expect(error?.message.toUpperCase()).toContain("SLUG_RESERVED");
    });

    it("RPC illegal slug → SLUG_INVALID", async () => {
      const { client } = await signUpFreshOwner();
      const { error } = await client.rpc("create_shop_with_owner", {
        p_name: "Bad",
        p_slug: "UPPERCASE",
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });
      expect(error?.message.toUpperCase()).toContain("SLUG_INVALID");
    });

    it("successful RPC writes shop + membership + audit atomically", async () => {
      const { client, slug } = await signUpFreshOwner();
      const { data: shop, error } = await client.rpc("create_shop_with_owner", {
        p_name: "Atomic Shop",
        p_slug: slug,
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });
      expect(error).toBeNull();

      const { data: memberships } = await client
        .from("memberships")
        .select("role")
        .eq("shop_id", shop!.id);
      expect(memberships).toHaveLength(1);

      const { data: audits } = await client
        .from("audit_logs")
        .select("action, entity")
        .eq("shop_id", shop!.id);
      expect(audits?.[0]?.action).toBe("shop.created");
      expect(audits?.[0]?.entity).toBe("shop");
    });
  });
});
