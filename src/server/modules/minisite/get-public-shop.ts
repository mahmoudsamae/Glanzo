import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { shopPublicCacheTag } from "@/lib/minisite/cache-tags";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { shopSlugSchema } from "@/lib/validations/shop";

import { fetchShopPublicDataBySlug } from "./get-shop-public-data";
import { resolveShopIdBySlug } from "./resolve-shop-id";

async function loadPublicShopUncached(slug: string): Promise<ShopPublicData | null> {
  return fetchShopPublicDataBySlug(slug);
}

/**
 * Cached public shop payload for ISR mini-site pages.
 * Tags `shop-public:{shopId}`; 300s safety-net revalidate.
 */
export const getPublicShopDataBySlug = cache(async (slug: string): Promise<ShopPublicData | null> => {
  const parsed = shopSlugSchema.safeParse(slug);
  if (!parsed.success) {
    return null;
  }

  const shopId = await resolveShopIdBySlug(parsed.data);
  if (!shopId) {
    return null;
  }

  const loadCached = unstable_cache(
    () => loadPublicShopUncached(parsed.data),
    ["shop-public-data", parsed.data],
    {
      tags: [shopPublicCacheTag(shopId)],
      revalidate: 300,
    },
  );

  return loadCached();
});
