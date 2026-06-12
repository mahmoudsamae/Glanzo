import "server-only";

import { revalidateTag } from "next/cache";

import { shopPublicCacheTag } from "@/lib/minisite/cache-tags";

/** Invalidate cached public shop payload after dashboard mutations. */
export function revalidateShopPublic(shopId: string): void {
  revalidateTag(shopPublicCacheTag(shopId));
}
