import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";

import { ANON_SHOP_FORBIDDEN_COLUMNS, SEED } from "./constants";
import { anonClient } from "./supabase-env";
import { PHASE2_MATRIX_ASSERTIONS, PHASE2_TABLE_REGISTRY } from "./matrix-phase2";
import { PHASE3_MATRIX_ASSERTIONS, PHASE3_TABLE_REGISTRY } from "./matrix-phase3";
import { PHASE5_MATRIX_ASSERTIONS, PHASE5_TABLE_REGISTRY } from "./matrix-phase5";
import { PHASE6_MATRIX_ASSERTIONS, PHASE6_TABLE_REGISTRY } from "./matrix-phase6";
import { PHASE7_MATRIX_ASSERTIONS, PHASE7_TABLE_REGISTRY } from "./matrix-phase7";
import {
  denyMessage,
  type ActorKey,
  type MatrixAssertion,
  type SecurityContext,
} from "./matrix-shared";

export type { ActorKey, MatrixAssertion, SecurityContext };
export { denyMessage };

/** Phase 2+ tenant-owned tables: add one entry here to extend the matrix. */
export const TENANT_TABLE_REGISTRY = [
  "shops",
  "memberships",
  "audit_logs",
  "profiles",
  "platform_admins",
  ...PHASE2_TABLE_REGISTRY,
  ...PHASE3_TABLE_REGISTRY,
  ...PHASE5_TABLE_REGISTRY,
] as const;

export type TenantTable = (typeof TENANT_TABLE_REGISTRY)[number];

export const MATRIX_ASSERTIONS: MatrixAssertion[] = [
  // --- SELECT shops ---
  {
    id: "ownerA SELECT shops[A]",
    actor: "ownerA",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("shops")
        .select("id, slug")
        .eq("slug", SEED.shops.a.slug);
      if (error) throw new Error(denyMessage("ownerA SELECT shops[A]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(denyMessage("ownerA SELECT shops[A]", "ROWS 1", `ROWS ${data?.length ?? 0}`));
      }
    },
  },
  {
    id: "ownerA SELECT shops[B]",
    actor: "ownerA",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("shops")
        .select("id")
        .eq("slug", SEED.shops.b.slug);
      if (error) throw new Error(denyMessage("ownerA SELECT shops[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA SELECT shops[B]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB SELECT shops[B]",
    actor: "ownerB",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("shops")
        .select("id")
        .eq("slug", SEED.shops.b.slug);
      if (error) throw new Error(denyMessage("ownerB SELECT shops[B]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(denyMessage("ownerB SELECT shops[B]", "ROWS 1", `ROWS ${data?.length ?? 0}`));
      }
    },
  },
  {
    id: "barberA SELECT shops[A]",
    actor: "barberA",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("shops")
        .select("slug")
        .eq("slug", SEED.shops.a.slug);
      if (error) throw new Error(denyMessage("barberA SELECT shops[A]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(denyMessage("barberA SELECT shops[A]", "ROWS 1", `ROWS ${data?.length ?? 0}`));
      }
    },
  },
  {
    id: "barberA SELECT shops[B]",
    actor: "barberA",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("shops")
        .select("id")
        .eq("slug", SEED.shops.b.slug);
      if (error) throw new Error(denyMessage("barberA SELECT shops[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("barberA SELECT shops[B]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "platformAdmin SELECT shops[all]",
    actor: "platformAdmin",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.from("shops").select("id");
      if (error) throw new Error(denyMessage("platformAdmin SELECT shops[all]", "no error", error.message));
      if (data?.length !== 2) {
        throw new Error(
          denyMessage("platformAdmin SELECT shops[all]", "ROWS 2", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  // --- SELECT memberships ---
  {
    id: "ownerA SELECT memberships[A]",
    actor: "ownerA",
    table: "memberships",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("memberships")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerA SELECT memberships[A]", "no error", error.message));
      if (data?.length !== 2) {
        throw new Error(
          denyMessage("ownerA SELECT memberships[A]", "ROWS 2", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA SELECT memberships[B]",
    actor: "ownerA",
    table: "memberships",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("memberships")
        .select("id")
        .eq("shop_id", SEED.shops.b.id);
      if (error) throw new Error(denyMessage("ownerA SELECT memberships[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA SELECT memberships[B]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB SELECT memberships[B]",
    actor: "ownerB",
    table: "memberships",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("memberships")
        .select("id")
        .eq("shop_id", SEED.shops.b.id);
      if (error) throw new Error(denyMessage("ownerB SELECT memberships[B]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("ownerB SELECT memberships[B]", "ROWS 1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  // --- SELECT audit_logs ---
  {
    id: "ownerA SELECT audit_logs[A]",
    actor: "ownerA",
    table: "audit_logs",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("audit_logs")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerA SELECT audit_logs[A]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("ownerA SELECT audit_logs[A]", "ROWS 1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA SELECT audit_logs[B]",
    actor: "ownerA",
    table: "audit_logs",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("audit_logs")
        .select("id")
        .eq("shop_id", SEED.shops.b.id);
      if (error) throw new Error(denyMessage("ownerA SELECT audit_logs[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA SELECT audit_logs[B]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "barberA SELECT audit_logs[all]",
    actor: "barberA",
    table: "audit_logs",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA.from("audit_logs").select("id");
      if (error) throw new Error(denyMessage("barberA SELECT audit_logs[all]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("barberA SELECT audit_logs[all]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "platformAdmin SELECT audit_logs[all]",
    actor: "platformAdmin",
    table: "audit_logs",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.from("audit_logs").select("id");
      if (error) throw new Error(denyMessage("platformAdmin SELECT audit_logs[all]", "no error", error.message));
      if ((data?.length ?? 0) < 2) {
        throw new Error(
          denyMessage("platformAdmin SELECT audit_logs[all]", "ROWS >=2", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  // --- SELECT profiles ---
  {
    id: "ownerA SELECT profiles[self]",
    actor: "ownerA",
    table: "profiles",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("profiles")
        .select("id")
        .eq("id", SEED.users.ownerA.id);
      if (error) throw new Error(denyMessage("ownerA SELECT profiles[self]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("ownerA SELECT profiles[self]", "ROWS 1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA SELECT profiles[shopmate barberA]",
    actor: "ownerA",
    table: "profiles",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("profiles")
        .select("id")
        .eq("id", SEED.users.barberA.id);
      if (error) throw new Error(denyMessage("ownerA SELECT profiles[shopmate]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("ownerA SELECT profiles[shopmate]", "ROWS 1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA SELECT profiles[ownerB cross-shop]",
    actor: "ownerA",
    table: "profiles",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("profiles")
        .select("id")
        .eq("id", SEED.users.ownerB.id);
      if (error) throw new Error(denyMessage("ownerA SELECT profiles[ownerB]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA SELECT profiles[ownerB]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "platformAdmin SELECT platform_admins",
    actor: "platformAdmin",
    table: "platform_admins",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.from("platform_admins").select("user_id");
      if (error) throw new Error(denyMessage("platformAdmin SELECT platform_admins", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("platformAdmin SELECT platform_admins", "ROWS 1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  // --- anon SELECT (Phase 5: direct shops read revoked; RPC only) ---
  {
    id: "anon SELECT shops[all]",
    actor: "anon",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { error } = await clients.anon.from("shops").select("*").limit(1);
      if (!error) {
        throw new Error(denyMessage("anon SELECT shops[all]", "DENY", "ALLOW"));
      }
    },
  },
  ...ANON_SHOP_FORBIDDEN_COLUMNS.map(
    (column): MatrixAssertion => ({
      id: `anon SELECT shops[forbidden ${column}]`,
      actor: "anon",
      table: "shops",
      operation: "SELECT",
      run: async ({ clients }) => {
        const { error } = await clients.anon.from("shops").select(column).limit(1);
        if (!error) {
          throw new Error(denyMessage(`anon SELECT shops[${column}]`, "DENY", "ALLOW"));
        }
      },
    }),
  ),
  ...(["memberships", "audit_logs", "profiles", "platform_admins"] as const).map(
    (table): MatrixAssertion => ({
      id: `anon SELECT ${table}[all]`,
      actor: "anon",
      table,
      operation: "SELECT",
      run: async ({ clients }) => {
        const { data, error } = await clients.anon.from(table).select("*").limit(1);
        if (error) throw new Error(denyMessage(`anon SELECT ${table}`, "no error", error.message));
        if ((data?.length ?? 0) !== 0) {
          throw new Error(denyMessage(`anon SELECT ${table}`, "ROWS 0", `ROWS ${data?.length}`));
        }
      },
    }),
  ),
  // --- UPDATE ---
  {
    id: "ownerA UPDATE shops[B]",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("shops")
        .update({ name: "Hacked" })
        .eq("id", SEED.shops.b.id)
        .select("id");
      if (error) throw new Error(denyMessage("ownerA UPDATE shops[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA UPDATE shops[B]", "DENY 0 rows", `ALLOW ${data?.length} rows`));
      }
    },
  },
  {
    id: "ownerA UPDATE shops[A] name",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("shops")
        .update({ name: "Demo Barber A" })
        .eq("id", SEED.shops.a.id)
        .select("id");
      if (error) throw new Error(denyMessage("ownerA UPDATE shops[A] name", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("ownerA UPDATE shops[A] name", "ALLOW 1 row", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA UPDATE shops[A] status",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("shops")
        .update({ status: "suspended" })
        .eq("id", SEED.shops.a.id);
      const message = error?.message ?? "";
      if (!error || !/service role may change shop status/i.test(message)) {
        throw new Error(denyMessage("ownerA UPDATE shops[A] status", "DENY", message || "ALLOW"));
      }
    },
  },
  {
    id: "ownerA UPDATE shops[A] slug",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("shops")
        .update({ slug: "new-slug" })
        .eq("id", SEED.shops.a.id);
      const message = error?.message ?? "";
      if (!error || !/slug is immutable/i.test(message)) {
        throw new Error(denyMessage("ownerA UPDATE shops[A] slug", "DENY", message || "ALLOW"));
      }
    },
  },
  {
    id: "barberA UPDATE shops[A]",
    actor: "barberA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("shops")
        .update({ name: "Barber edit" })
        .eq("id", SEED.shops.a.id)
        .select("id");
      if (error) throw new Error(denyMessage("barberA UPDATE shops[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("barberA UPDATE shops[A]", "DENY", "ALLOW"));
      }
    },
  },
  {
    id: "platformAdmin UPDATE shops[B] status",
    actor: "platformAdmin",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.platformAdmin
        .from("shops")
        .update({ status: "active" })
        .eq("id", SEED.shops.b.id);
      const message = error?.message ?? "";
      if (!error || !/service role may change shop status/i.test(message)) {
        throw new Error(
          denyMessage("platformAdmin UPDATE shops[B] status", "DENY", message || "ALLOW"),
        );
      }
    },
  },
  {
    id: "ownerA UPDATE audit_logs",
    actor: "ownerA",
    table: "audit_logs",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("audit_logs")
        .update({ action: "tampered" })
        .eq("shop_id", SEED.shops.a.id);
      if (!error) throw new Error(denyMessage("ownerA UPDATE audit_logs", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA DELETE audit_logs",
    actor: "ownerA",
    table: "audit_logs",
    operation: "DELETE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("audit_logs")
        .delete()
        .eq("shop_id", SEED.shops.a.id);
      if (!error) throw new Error(denyMessage("ownerA DELETE audit_logs", "DENY", "ALLOW"));
    },
  },
  // --- INSERT denials ---
  {
    id: "ownerA INSERT shops",
    actor: "ownerA",
    table: "shops",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.from("shops").insert({
        slug: "illegal-insert-test",
        name: "Illegal",
      });
      if (!error) throw new Error(denyMessage("ownerA INSERT shops", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA INSERT memberships",
    actor: "ownerA",
    table: "memberships",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.from("memberships").insert({
        shop_id: SEED.shops.a.id,
        user_id: SEED.users.ownerB.id,
        role: "barber",
      });
      if (!error) throw new Error(denyMessage("ownerA INSERT memberships", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA INSERT platform_admins",
    actor: "ownerA",
    table: "platform_admins",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("platform_admins")
        .insert({ user_id: SEED.users.ownerA.id });
      if (!error) throw new Error(denyMessage("ownerA INSERT platform_admins", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA INSERT audit_logs",
    actor: "ownerA",
    table: "audit_logs",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.from("audit_logs").insert({
        shop_id: SEED.shops.a.id,
        actor_id: SEED.users.ownerA.id,
        actor_type: "user",
        action: "tampered",
        entity: "shop",
      });
      if (!error) throw new Error(denyMessage("ownerA INSERT audit_logs", "DENY", "ALLOW"));
    },
  },
  // --- DELETE denials ---
  {
    id: "ownerA DELETE shops[A]",
    actor: "ownerA",
    table: "shops",
    operation: "DELETE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.from("shops").delete().eq("id", SEED.shops.a.id);
      if (!error) throw new Error(denyMessage("ownerA DELETE shops[A]", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA DELETE memberships[A]",
    actor: "ownerA",
    table: "memberships",
    operation: "DELETE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("memberships")
        .delete()
        .eq("shop_id", SEED.shops.a.id);
      if (!error) throw new Error(denyMessage("ownerA DELETE memberships[A]", "DENY", "ALLOW"));
    },
  },
  // --- RPC / helpers ---
  {
    id: "anon RPC create_shop_with_owner",
    actor: "anon",
    table: "shops",
    operation: "RPC",
    run: async ({ clients }) => {
      const { error } = await clients.anon.rpc("create_shop_with_owner", {
        p_name: "Anon Shop",
        p_slug: "anon-rpc-test",
        p_timezone: "Europe/Berlin",
        p_opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
      });
      if (!error) throw new Error(denyMessage("anon RPC create_shop_with_owner", "DENY", "ALLOW"));
    },
  },
  {
    id: "ownerA RPC is_platform_admin",
    actor: "ownerA",
    table: "shops",
    operation: "RPC",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA.rpc("is_platform_admin");
      if (error) throw new Error(denyMessage("ownerA RPC is_platform_admin", "no error", error.message));
      if (data !== false) {
        throw new Error(denyMessage("ownerA RPC is_platform_admin", "false", String(data)));
      }
    },
  },
  {
    id: "platformAdmin RPC is_platform_admin",
    actor: "platformAdmin",
    table: "shops",
    operation: "RPC",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.rpc("is_platform_admin");
      if (error) {
        throw new Error(denyMessage("platformAdmin RPC is_platform_admin", "no error", error.message));
      }
      if (data !== true) {
        throw new Error(denyMessage("platformAdmin RPC is_platform_admin", "true", String(data)));
      }
    },
  },
  {
    id: "ownerA RPC user_shop_ids",
    actor: "ownerA",
    table: "shops",
    operation: "RPC",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA.rpc("user_shop_ids");
      if (error) throw new Error(denyMessage("ownerA RPC user_shop_ids", "no error", error.message));
      const ids = (data as string[] | null) ?? [];
      if (ids.length !== 1 || ids[0] !== SEED.shops.a.id) {
        throw new Error(
          denyMessage("ownerA RPC user_shop_ids", `[shopA]`, JSON.stringify(ids)),
        );
      }
    },
  },
  ...PHASE2_MATRIX_ASSERTIONS,
  ...PHASE3_MATRIX_ASSERTIONS,
  ...PHASE5_MATRIX_ASSERTIONS,
  ...PHASE6_MATRIX_ASSERTIONS,
  ...PHASE7_MATRIX_ASSERTIONS,
];

export function matrixDimensions(): {
  actors: number;
  tables: number;
  operations: number;
  assertions: number;
} {
  return {
    actors: new Set(MATRIX_ASSERTIONS.map((row) => row.actor)).size,
    tables: TENANT_TABLE_REGISTRY.length,
    operations: new Set(MATRIX_ASSERTIONS.map((row) => row.operation)).size,
    assertions: MATRIX_ASSERTIONS.length,
  };
}

export async function signUpFreshOwner(): Promise<{
  client: SupabaseClient<Database>;
  slug: string;
}> {
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `security-${suffix}@glanzo.test`;
  const slug = `sec-shop-${suffix}`;

  const client = anonClient();

  const { data, error } = await client.auth.signUp({
    email,
    password: "password123",
    options: { data: { display_name: `Sec ${suffix}` } },
  });

  if (error || !data.user) {
    throw new Error(`signUpFreshOwner failed: ${error?.message ?? "no user"}`);
  }

  return { client, slug };
}
