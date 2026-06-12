/** ISR tag for public mini-site payload — must match `revalidateShopPublic`. */
export function shopPublicCacheTag(shopId: string): string {
  return `shop-public:${shopId}`;
}
