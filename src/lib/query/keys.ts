/**
 * Every query key starts with shopId so cross-tenant cache bleed is structurally awkward.
 * Convention: [shopId, domain, ...params]
 */
export function shopQueryKey(shopId: string, domain: string, params?: unknown) {
  if (params === undefined) {
    return [shopId, domain] as const;
  }
  return [shopId, domain, params] as const;
}
