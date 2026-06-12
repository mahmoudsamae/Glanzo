import { clientEnv } from "@/lib/env";

/** Public URL for a shop-media storage object path. */
export function shopMediaPublicUrl(path: string): string {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    return "";
  }
  return `${base}/storage/v1/object/public/shop-media/${path.replace(/^\//, "")}`;
}
