import type { SecurityClient } from "./supabase-env";

export type ActorKey = "ownerA" | "barberA" | "ownerB" | "anon" | "platformAdmin";

export type SecurityContext = {
  clients: Record<ActorKey, SecurityClient>;
};

export type MatrixAssertion = {
  id: string;
  actor: ActorKey;
  table: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "RPC";
  run: (ctx: SecurityContext) => Promise<void>;
};

export function denyMessage(id: string, expected: string, got: string): string {
  return `${id} expected ${expected} got ${got}`;
}
