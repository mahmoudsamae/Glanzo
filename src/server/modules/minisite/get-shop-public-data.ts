import "server-only";

import { parseShopPublicData, type ShopPublicData } from "@/lib/validations/public-shop";
import { createAnonServerClient } from "@/lib/supabase/server";

/**
 * Fetch whitelisted public shop payload via SECURITY DEFINER RPC.
 * Anon-safe — the only door for the public mini-site surface.
 */
export async function fetchShopPublicDataBySlug(
  slug: string,
): Promise<ShopPublicData | null> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase.rpc("get_shop_public_data", {
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  if (data === null || data === undefined) {
    return null;
  }

  const parsed = parseShopPublicData(data);
  if (!parsed.ok) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(`get_shop_public_data contract violation: ${parsed.error.message}`);
    }
    console.error("get_shop_public_data contract violation", parsed.error.flatten());
    return null;
  }

  return parsed.data;
}
