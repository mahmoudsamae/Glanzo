import "server-only";

import type { Database, Json } from "@/types/database.types";
import { createServiceRoleClient } from "@/lib/supabase/service";

type AuditInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export async function writeAuditLog(entry: AuditInsert): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("audit_logs").insert(entry);
  if (error) {
    throw error;
  }
}

export function auditDiff(before: Record<string, Json | undefined>, after: Record<string, Json | undefined>) {
  return { before, after } satisfies Json;
}
