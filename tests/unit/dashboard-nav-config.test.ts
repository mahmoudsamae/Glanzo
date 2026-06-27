import { describe, expect, it } from "vitest";

import { canViewShopRevenue } from "@/lib/dashboard/nav-config";

describe("canViewShopRevenue", () => {
  it("allows owners to see revenue", () => {
    expect(canViewShopRevenue("owner")).toBe(true);
  });

  it("hides revenue from barbers", () => {
    expect(canViewShopRevenue("barber")).toBe(false);
  });
});
