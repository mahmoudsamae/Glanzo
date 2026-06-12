import { describe, expect, it } from "vitest";

import { buildShopJsonLd } from "@/lib/minisite/json-ld";
import type { ShopPublicData } from "@/lib/validations/public-shop";

const BASE: ShopPublicData = {
  shop: {
    name: "Test Salon",
    slug: "test-salon",
    status: "active",
    timezone: "Europe/Berlin",
    opening_hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null,
    },
  },
  services: [],
  team: [],
  minisite: {
    template: "classic",
    accent_hex: "#b08d4a",
    content: {
      hero_headline: "Welcome",
      address: "Hauptstr. 1",
    },
  },
};

describe("buildShopJsonLd", () => {
  it("emits HairSalon with opening hours and address", () => {
    const json = buildShopJsonLd(BASE, "https://glanzo.app");

    expect(json["@type"]).toBe("HairSalon");
    expect(json.name).toBe("Test Salon");
    expect(json.url).toBe("https://glanzo.app/s/test-salon");
    expect(json.address).toBe("Hauptstr. 1");
    expect(json.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: "09:00",
        closes: "18:00",
      },
    ]);
  });
});
