import { describe, expect, it } from "vitest";

import {
  clearBookingIdempotencyKey,
  getOrCreateBookingIdempotencyKey,
  idempotencyStorageKey,
} from "@/lib/booking/idempotency";

function mockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key() {
      return null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("booking idempotency", () => {
  it("reuses the same key within a session", () => {
    const storage = mockStorage();
    const a = getOrCreateBookingIdempotencyKey("demo-shop", storage);
    const b = getOrCreateBookingIdempotencyKey("demo-shop", storage);
    expect(a).toBe(b);
    expect(storage.getItem(idempotencyStorageKey("demo-shop"))).toBe(a);
  });

  it("clears after success", () => {
    const storage = mockStorage();
    getOrCreateBookingIdempotencyKey("demo-shop", storage);
    clearBookingIdempotencyKey("demo-shop", storage);
    expect(storage.getItem(idempotencyStorageKey("demo-shop"))).toBeNull();
  });
});
