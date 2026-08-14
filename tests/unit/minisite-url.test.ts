import { describe, expect, it } from "vitest";

import { buildShopMinisiteUrlForDomain } from "@/lib/dashboard/minisite-url";

describe("buildShopMinisiteUrlForDomain", () => {
  it("uses /s/{slug} on Vercel hosts even if the env value includes https://", () => {
    expect(buildShopMinisiteUrlForDomain("s00", "https://glanzo-63fx.vercel.app/")).toBe(
      "https://glanzo-63fx.vercel.app/s/s00",
    );
  });

  it("uses a tenant subdomain on custom production domains", () => {
    expect(buildShopMinisiteUrlForDomain("s00", "glanzo.app")).toBe("https://s00.glanzo.app");
  });

  it("uses http and /s/{slug} on localhost", () => {
    expect(buildShopMinisiteUrlForDomain("s00", "localhost:3000")).toBe(
      "http://localhost:3000/s/s00",
    );
  });
});
