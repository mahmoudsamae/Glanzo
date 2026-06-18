import { clientEnv } from "@/lib/env";

import { isTemplateStockPath } from "./template-stock-images";

/** Public URL for a shop-media storage object path. */
export function shopMediaPublicUrl(path: string): string {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    return "";
  }
  return `${base}/storage/v1/object/public/shop-media/${path.replace(/^\//, "")}`;
}

/** Shop storage path or static stock path (/classic/…). */
export function minisiteImageUrl(path: string): string {
  if (!path) {
    return "";
  }
  if (isTemplateStockPath(path) || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return shopMediaPublicUrl(path);
}
