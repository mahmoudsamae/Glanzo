import type { Database } from "@/types/database.types";

import {
  assertNoForbiddenShopDetailKeys,
  FORBIDDEN_PLATFORM_SHOP_DETAIL_KEYS,
} from "@/lib/validations/platform-admin";

import { SEED } from "./constants";
import { denyMessage, type MatrixAssertion } from "./matrix-shared";

type PlatformRpcName =
  | "platform_create_owner_invite"
  | "platform_create_shop"
  | "platform_get_overview"
  | "platform_get_shop"
  | "platform_get_shop_today"
  | "platform_list_shops"
  | "platform_record_support_view"
  | "platform_set_shop_status";

const PLATFORM_RPCS: PlatformRpcName[] = [
  "platform_get_overview",
  "platform_list_shops",
  "platform_get_shop",
  "platform_get_shop_today",
  "platform_set_shop_status",
  "platform_create_shop",
  "platform_create_owner_invite",
  "platform_record_support_view",
];

function platformRpcArgs(rpc: PlatformRpcName): Database["public"]["Functions"][PlatformRpcName]["Args"] {
  switch (rpc) {
    case "platform_list_shops":
      return { p_search: null, p_status: null, p_cursor: null };
    case "platform_get_overview":
      return {};
    case "platform_create_shop":
      return {
        p_name: "Matrix Forbidden",
        p_slug: `matrix-${crypto.randomUUID().slice(0, 8)}`,
        p_owner_email: "matrix@glanzo.test",
        p_timezone: "Europe/Berlin",
      };
    case "platform_create_owner_invite":
      return { p_shop_id: SEED.shops.a.id, p_owner_email: "matrix@glanzo.test" };
    case "platform_set_shop_status":
      return {
        p_shop_id: SEED.shops.a.id,
        p_status: "suspended",
        p_reason: "matrix forbidden sweep",
      };
    case "platform_record_support_view":
      return { p_shop_id: SEED.shops.a.id };
    default:
      return { p_shop_id: SEED.shops.a.id };
  }
}

function forbiddenRpcSweep(actor: "ownerA" | "barberA" | "anon", rpc: PlatformRpcName): MatrixAssertion {
  return {
    id: `${actor} RPC ${rpc}`,
    actor,
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const client = clients[actor];
      const { error } = await client.rpc(rpc, platformRpcArgs(rpc));
      if (!error) {
        throw new Error(denyMessage(`${actor} ${rpc}`, "DENY", "ALLOW"));
      }
      if (!/FORBIDDEN|permission|42501/i.test(error.message)) {
        throw new Error(denyMessage(`${actor} ${rpc}`, "FORBIDDEN", error.message));
      }
    },
  };
}

export const PHASE7_TABLE_REGISTRY = [] as const;

export const PHASE7_MATRIX_ASSERTIONS: MatrixAssertion[] = [
  ...PLATFORM_RPCS.flatMap((rpc) => [
    forbiddenRpcSweep("ownerA", rpc),
    forbiddenRpcSweep("barberA", rpc),
    forbiddenRpcSweep("anon", rpc),
  ]),
  {
    id: "platformAdmin RPC platform_get_overview",
    actor: "platformAdmin",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.rpc("platform_get_overview");
      if (error) {
        throw new Error(denyMessage("platformAdmin platform_get_overview", "no error", error.message));
      }
      if (!data || typeof data !== "object") {
        throw new Error(denyMessage("platformAdmin platform_get_overview", "object", String(data)));
      }
    },
  },
  {
    id: "platformAdmin RPC platform_set_shop_status reactivate B",
    actor: "platformAdmin",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.platformAdmin.rpc("platform_set_shop_status", {
        p_shop_id: SEED.shops.b.id,
        p_status: "active",
        p_reason: "matrix test reactivation path",
      });
      if (error) {
        throw new Error(denyMessage("platformAdmin platform_set_shop_status", "no error", error.message));
      }
    },
  },
  {
    id: "platformAdmin RPC platform_get_shop excludes customer fields",
    actor: "platformAdmin",
    table: "shops",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.platformAdmin.rpc("platform_get_shop", {
        p_shop_id: SEED.shops.a.id,
      });
      if (error) {
        throw new Error(denyMessage("platformAdmin platform_get_shop", "no error", error.message));
      }
      const record = data as Record<string, unknown>;
      for (const key of FORBIDDEN_PLATFORM_SHOP_DETAIL_KEYS) {
        if (key in record) {
          throw new Error(denyMessage("platform_get_shop shape", `no ${key}`, `has ${key}`));
        }
      }
      assertNoForbiddenShopDetailKeys(record);
    },
  },
  {
    id: "ownerA RPC platform_set_shop_status",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.rpc("platform_set_shop_status", {
        p_shop_id: SEED.shops.a.id,
        p_status: "suspended",
        p_reason: "owner should not suspend via platform rpc",
      });
      if (!error) {
        throw new Error(denyMessage("ownerA platform_set_shop_status", "DENY", "ALLOW"));
      }
    },
  },
];
