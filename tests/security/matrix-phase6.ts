import { SEED } from "./constants";
import { denyMessage, type MatrixAssertion } from "./matrix-shared";

export const PHASE6_TABLE_REGISTRY = ["shops"] as const;

export type Phase6Table = (typeof PHASE6_TABLE_REGISTRY)[number];

export const PHASE6_MATRIX_ASSERTIONS: MatrixAssertion[] = [
  {
    id: "ownerA UPDATE shops.reminders_enabled[A]",
    actor: "ownerA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA
        .from("shops")
        .update({ reminders_enabled: false })
        .eq("id", SEED.shops.a.id);
      if (error) {
        throw new Error(denyMessage("ownerA UPDATE reminders_enabled", "ALLOW", error.message));
      }
      await clients.ownerA
        .from("shops")
        .update({ reminders_enabled: true })
        .eq("id", SEED.shops.a.id);
    },
  },
  {
    id: "barberA UPDATE shops.reminders_enabled[A]",
    actor: "barberA",
    table: "shops",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { error } = await clients.barberA
        .from("shops")
        .update({ reminders_enabled: false })
        .eq("id", SEED.shops.a.id);
      if (!error) {
        throw new Error(denyMessage("barberA UPDATE reminders_enabled", "DENY", "ALLOW"));
      }
    },
  },
  {
    id: "anon EXECUTE claim_outbox_batch",
    actor: "anon",
    table: "notification_outbox",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { error } = await clients.anon.rpc("claim_outbox_batch", { p_limit: 1 });
      if (!error) {
        throw new Error(denyMessage("anon claim_outbox_batch", "DENY", "ALLOW"));
      }
    },
  },
];
