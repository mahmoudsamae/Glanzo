import { describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";
import {
  parseShopPublicData,
  shopPublicDataSchema,
} from "@/lib/validations/public-shop";

const VALID_PAYLOAD = {
  shop: {
    name: "Classic Cuts",
    slug: "classic-cuts",
    status: "active" as const,
    timezone: "Europe/Berlin",
    opening_hours: DEFAULT_ONBOARDING_OPENING_HOURS,
  },
  services: [
    {
      id: "f0000000-0000-4000-8000-000000000001",
      name: "Haircut",
      duration_min: 30,
      price_cents: 2500,
    },
  ],
  team: [
    {
      membership_id: "d0000000-0000-4000-8000-000000000003",
      display_name: "Alex",
    },
  ],
  minisite: {
    template: "midnight" as const,
    accent_hex: "#b08d4a",
    content: {
      hero_headline: "Willkommen",
      gallery: ["b0000000-0000-4000-8000-000000000001/gallery/1.webp"],
    },
  },
};

describe("shopPublicDataSchema", () => {
  it("accepts a valid whitelisted payload", () => {
    const result = parseShopPublicData(VALID_PAYLOAD);
    expect(result.ok).toBe(true);
  });

  it("rejects extra top-level keys", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      shop_id: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra shop keys", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      shop: { ...VALID_PAYLOAD.shop, id: "b0000000-0000-4000-8000-000000000001" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra service keys", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      services: [{ ...VALID_PAYLOAD.services[0], shop_id: "leak" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid accent hex", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      minisite: { ...VALID_PAYLOAD.minisite, accent_hex: "gold" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects gallery longer than 8", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      minisite: {
        ...VALID_PAYLOAD.minisite,
        content: {
          gallery: Array.from({ length: 9 }, (_, i) => `path/${i}.webp`),
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown content keys", () => {
    const result = shopPublicDataSchema.safeParse({
      ...VALID_PAYLOAD,
      minisite: {
        ...VALID_PAYLOAD.minisite,
        content: { phone: "+491701234567" },
      },
    });
    expect(result.success).toBe(false);
  });
});
