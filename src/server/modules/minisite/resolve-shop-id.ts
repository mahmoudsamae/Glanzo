import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service";

/** Server-only ISR plumbing — not part of the anon public surface. */
export async function resolveShopIdBySlug(slug: string): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("shops").select("id").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}
