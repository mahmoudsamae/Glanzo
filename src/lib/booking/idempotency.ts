export const IDEMPOTENCY_KEY_PREFIX = "glanzo:booking-idempotency:";

export function idempotencyStorageKey(shopSlug: string): string {
  return `${IDEMPOTENCY_KEY_PREFIX}${shopSlug}`;
}

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function getOrCreateBookingIdempotencyKey(
  shopSlug: string,
  storage: Pick<Storage, "getItem" | "setItem">,
): string {
  const key = idempotencyStorageKey(shopSlug);
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }
  const fresh = createIdempotencyKey();
  storage.setItem(key, fresh);
  return fresh;
}

export function clearBookingIdempotencyKey(
  shopSlug: string,
  storage: Pick<Storage, "removeItem">,
): void {
  storage.removeItem(idempotencyStorageKey(shopSlug));
}
