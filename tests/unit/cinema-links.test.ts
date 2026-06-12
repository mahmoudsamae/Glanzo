import { describe, expect, it } from "vitest";

import { clampHeroTilt, shouldApplyCinemaMotion } from "@/lib/minisite/cinema-math";
import {
  bookingContactFallback,
  linksToSameAs,
  minisiteLinksObjectSchema,
  normalizeWhatsAppUrl,
} from "@/lib/validations/minisite-links";

describe("minisite links validation", () => {
  it("accepts full social URLs", () => {
    const parsed = minisiteLinksObjectSchema.safeParse({
      facebook: "https://facebook.com/salon",
      tiktok: "https://tiktok.com/@salon",
      website: "https://salon.example",
      google_maps: "https://maps.google.com/?q=Berlin",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts instagram handle", () => {
    expect(minisiteLinksObjectSchema.safeParse({ instagram: "@demo_barber" }).success).toBe(true);
  });

  it("accepts wa.me URL", () => {
    expect(
      minisiteLinksObjectSchema.safeParse({ whatsapp: "https://wa.me/491701234567" }).success,
    ).toBe(true);
  });

  it("accepts E.164 whatsapp number", () => {
    expect(minisiteLinksObjectSchema.safeParse({ whatsapp: "+491701234567" }).success).toBe(true);
  });

  it("rejects bad http schemes", () => {
    expect(minisiteLinksObjectSchema.safeParse({ website: "ftp://bad" }).success).toBe(false);
  });

  it("rejects invalid whatsapp", () => {
    expect(minisiteLinksObjectSchema.safeParse({ whatsapp: "not-a-number" }).success).toBe(false);
  });

  it("rejects unknown keys (strict)", () => {
    expect(minisiteLinksObjectSchema.safeParse({ twitter: "https://x.com/x" }).success).toBe(false);
  });

  it("builds sameAs for SEO", () => {
    const urls = linksToSameAs({
      instagram: "@demo",
      website: "https://demo.example",
    });
    expect(urls).toContain("https://instagram.com/demo");
    expect(urls).toContain("https://demo.example");
  });
});

describe("whatsapp helpers", () => {
  it("normalizes E.164 to wa.me", () => {
    expect(normalizeWhatsAppUrl("+491701234567")).toBe("https://wa.me/491701234567");
  });

  it("prefers whatsapp in booking fallback chain", () => {
    const fb = bookingContactFallback({
      whatsapp: "+491701234567",
      instagram: "@demo",
    });
    expect(fb.href).toBe("https://wa.me/491701234567");
  });

  it("falls back to instagram", () => {
    const fb = bookingContactFallback({ instagram: "@demo" });
    expect(fb.href).toContain("instagram.com/demo");
  });
});

describe("cinema math", () => {
  it("clamps hero tilt to max degrees", () => {
    const { rotateX, rotateY } = clampHeroTilt(2, 2, 3);
    expect(Math.abs(rotateX)).toBeLessThanOrEqual(3);
    expect(Math.abs(rotateY)).toBeLessThanOrEqual(3);
  });

  it("disables cinema when reduced motion preferred", () => {
    expect(shouldApplyCinemaMotion(true)).toBe(false);
    expect(shouldApplyCinemaMotion(false)).toBe(true);
  });
});
