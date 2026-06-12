import { describe, expect, it } from "vitest";

import {
  isValidShopMediaPath,
  validateMinisiteMediaPaths,
} from "@/lib/validations/minisite-editor";

const SHOP = "shop-uuid-1";

describe("minisite media path validation", () => {
  it("accepts paths under {shop_id}/{kind}/", () => {
    expect(isValidShopMediaPath(SHOP, `${SHOP}/logo/abc.webp`, "logo")).toBe(true);
    expect(isValidShopMediaPath(SHOP, `${SHOP}/cover/hero.webp`, "cover")).toBe(true);
    expect(isValidShopMediaPath(SHOP, `${SHOP}/gallery/1.webp`, "gallery")).toBe(true);
  });

  it("rejects wrong shop prefix or kind", () => {
    expect(isValidShopMediaPath(SHOP, "other-shop/logo/x.webp")).toBe(false);
    expect(isValidShopMediaPath(SHOP, `${SHOP}/logo/x.webp`, "cover")).toBe(false);
    expect(isValidShopMediaPath(SHOP, `${SHOP}/unknown/x.webp`)).toBe(false);
  });

  it("validateMinisiteMediaPaths checks all content fields", () => {
    expect(
      validateMinisiteMediaPaths(SHOP, {
        logo_path: `${SHOP}/logo/a.webp`,
        cover_path: `${SHOP}/cover/b.webp`,
        gallery: [`${SHOP}/gallery/c.webp`],
      }),
    ).toBe(true);

    expect(
      validateMinisiteMediaPaths(SHOP, {
        logo_path: "evil/logo/a.webp",
      }),
    ).toBe(false);
  });
});
