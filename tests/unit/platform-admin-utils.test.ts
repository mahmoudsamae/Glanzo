import { describe, expect, it } from "vitest";

import { normalizeHourlyHistogram } from "@/lib/admin/histogram";
import { decodeShopListCursor, encodeShopListCursor } from "@/lib/admin/cursor-codec";
import { buildOwnerInviteMessage, buildWhatsAppShareUrl } from "@/lib/admin/wa-me";
import {
  assertNoForbiddenShopDetailKeys,
  platformStatusReasonSchema,
} from "@/lib/validations/platform-admin";

describe("platform admin utils", () => {
  it("validates status reason min length", () => {
    expect(platformStatusReasonSchema.safeParse("short").success).toBe(false);
    expect(platformStatusReasonSchema.safeParse("valid reason here").success).toBe(true);
  });

  it("round-trips shop list cursor", () => {
    const encoded = encodeShopListCursor("2026-06-01T12:00:00.000Z", "b0000000-0000-4000-8000-000000000001");
    expect(decodeShopListCursor(encoded)).toEqual({
      createdAt: "2026-06-01T12:00:00.000Z",
      id: "b0000000-0000-4000-8000-000000000001",
    });
  });

  it("builds wa.me share URL", () => {
    const url = buildWhatsAppShareUrl(null, "Hallo Welt");
    expect(url).toContain("https://wa.me/?text=");
    expect(url).toContain(encodeURIComponent("Hallo Welt"));
  });

  it("builds German owner invite message", () => {
    const msg = buildOwnerInviteMessage("Demo Barber", "https://app.test/join/abc");
    expect(msg).toContain("Demo Barber");
    expect(msg).toContain("https://app.test/join/abc");
  });

  it("normalizes hourly histogram to 24 buckets", () => {
    const rows = normalizeHourlyHistogram([{ hour: 9, count: 3 }, { hour: 14, count: 1 }]);
    expect(rows).toHaveLength(24);
    expect(rows[9]?.count).toBe(3);
    expect(rows[0]?.count).toBe(0);
  });

  it("rejects forbidden shop detail keys", () => {
    expect(() => assertNoForbiddenShopDetailKeys({ customers: [] })).toThrow(/forbidden key/);
    expect(() => assertNoForbiddenShopDetailKeys({ slug: "demo" })).not.toThrow();
  });
});
