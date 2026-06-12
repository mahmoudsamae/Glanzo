import { cache } from "react";

import type { ShopPublicData } from "@/lib/validations/public-shop";
import { getPublicShopDataBySlug } from "@/server/modules/minisite/get-public-shop";

/** Cached public mini-site payload — RPC + ISR (Phase 5). */
export const loadPublicShopBySlug = cache(
  async (slug: string): Promise<ShopPublicData | null> => getPublicShopDataBySlug(slug),
);
