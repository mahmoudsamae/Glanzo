import {
  SHOP_PUBLIC_DATA_ROOT_KEYS,
  SHOP_PUBLIC_MINISITE_KEYS,
  SHOP_PUBLIC_SERVICE_KEYS,
  SHOP_PUBLIC_SHOP_KEYS,
  SHOP_PUBLIC_TEAM_KEYS,
  parseShopPublicData,
} from "@/lib/validations/public-shop";

import { SEED } from "./constants";
import { denyMessage, type MatrixAssertion } from "./matrix-shared";

export const PHASE5_TABLE_REGISTRY = ["minisite"] as const;

export type Phase5Table = (typeof PHASE5_TABLE_REGISTRY)[number];

function assertExactKeys(
  value: unknown,
  allowed: readonly string[],
  path: string,
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(denyMessage(path, "object", typeof value));
  }
  const keys = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    throw new Error(
      denyMessage(path, `keys [${expected.join(",")}]`, `keys [${keys.join(",")}]`),
    );
  }
}

export const PHASE5_MATRIX_ASSERTIONS: MatrixAssertion[] = [
  {
    id: "ownerA SELECT minisite[A]",
    actor: "ownerA",
    table: "minisite",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("minisite")
        .select("shop_id, template, accent_hex")
        .eq("shop_id", SEED.shops.a.id)
        .maybeSingle();
      if (error) {
        throw new Error(denyMessage("ownerA SELECT minisite[A]", "no error", error.message));
      }
      if (!data) {
        throw new Error(denyMessage("ownerA SELECT minisite[A]", "ROW 1", "ROW 0"));
      }
    },
  },
  {
    id: "ownerB SELECT minisite[A]",
    actor: "ownerB",
    table: "minisite",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("minisite")
        .select("shop_id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) {
        throw new Error(denyMessage("ownerB SELECT minisite[A]", "no error", error.message));
      }
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT minisite[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "barberA SELECT minisite[A]",
    actor: "barberA",
    table: "minisite",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("minisite")
        .select("shop_id")
        .eq("shop_id", SEED.shops.a.id)
        .maybeSingle();
      if (error) {
        throw new Error(denyMessage("barberA SELECT minisite[A]", "no error", error.message));
      }
      if (!data) {
        throw new Error(denyMessage("barberA SELECT minisite[A]", "ROW 1", "ROW 0"));
      }
    },
  },
  ...PHASE5_TABLE_REGISTRY.map(
    (table): MatrixAssertion => ({
      id: `anon SELECT ${table}[all]`,
      actor: "anon",
      table,
      operation: "SELECT",
      run: async ({ clients }) => {
        const { data, error } = await clients.anon.from(table).select("*").limit(1);
        if (error) {
          throw new Error(denyMessage(`anon SELECT ${table}`, "no error", error.message));
        }
        if ((data?.length ?? 0) !== 0) {
          throw new Error(denyMessage(`anon SELECT ${table}`, "ROWS 0", `ROWS ${data?.length}`));
        }
      },
    }),
  ),
  {
    id: "anon RPC get_shop_public_data[exact shape]",
    actor: "anon",
    table: "minisite",
    operation: "RPC",
    run: async ({ clients }) => {
      const { data, error } = await clients.anon.rpc("get_shop_public_data", {
        p_slug: SEED.shops.a.slug,
      });
      if (error) {
        throw new Error(
          denyMessage("anon RPC get_shop_public_data", "no error", error.message),
        );
      }
      if (!data) {
        throw new Error(denyMessage("anon RPC get_shop_public_data", "payload", "null"));
      }

      assertExactKeys(data, SHOP_PUBLIC_DATA_ROOT_KEYS, "root");
      assertExactKeys(data.shop, SHOP_PUBLIC_SHOP_KEYS, "shop");

      if (!Array.isArray(data.services)) {
        throw new Error(denyMessage("services", "array", typeof data.services));
      }
      for (const [index, service] of data.services.entries()) {
        assertExactKeys(service, SHOP_PUBLIC_SERVICE_KEYS, `services[${index}]`);
      }

      if (!Array.isArray(data.team)) {
        throw new Error(denyMessage("team", "array", typeof data.team));
      }
      for (const [index, member] of data.team.entries()) {
        assertExactKeys(member, SHOP_PUBLIC_TEAM_KEYS, `team[${index}]`);
      }

      assertExactKeys(data.minisite, SHOP_PUBLIC_MINISITE_KEYS, "minisite");

      const parsed = parseShopPublicData(data);
      if (!parsed.ok) {
        throw new Error(
          denyMessage("anon RPC get_shop_public_data", "zod ok", parsed.error.message),
        );
      }
    },
  },
  {
    id: "anon RPC get_shop_public_data[unknown slug]",
    actor: "anon",
    table: "minisite",
    operation: "RPC",
    run: async ({ clients }) => {
      const { data, error } = await clients.anon.rpc("get_shop_public_data", {
        p_slug: "no-such-shop-slug-xyz",
      });
      if (error) {
        throw new Error(
          denyMessage("anon RPC get_shop_public_data unknown", "no error", error.message),
        );
      }
      if (data !== null) {
        throw new Error(
          denyMessage("anon RPC get_shop_public_data unknown", "null", String(data)),
        );
      }
    },
  },
];
