import { describe, expect, it } from "vitest";

import {
  DASHBOARD_NAV,
  isNavItemActive,
  navItemsForSurface,
} from "@/components/layout/nav";

describe("dashboard nav config", () => {
  it("mobile surface includes More sheet trigger", () => {
    const items = navItemsForSurface("mobile", "owner");
    expect(items.map((item) => item.key)).toEqual(["today", "calendar", "customers", "more"]);
    expect(items.find((item) => item.key === "more")?.isSheetTrigger).toBe(true);
  });

  it("desktop rail excludes More for barber (no owner entries)", () => {
    const items = navItemsForSurface("desktop-rail", "barber");
    expect(items.map((item) => item.key)).toEqual(["today", "calendar", "customers"]);
  });

  it("desktop rail includes owner Phase 2 entries", () => {
    const items = navItemsForSurface("desktop-rail", "owner");
    expect(items.map((item) => item.key)).toEqual([
      "today",
      "calendar",
      "customers",
      "services",
      "staff",
      "minisite",
      "settings",
    ]);
    expect(items.find((item) => item.key === "settings")?.enabled).toBe(true);
  });

  it("marks Today active only on /d", () => {
    expect(isNavItemActive("/d", "/d")).toBe(true);
    expect(isNavItemActive("/d", "/d/calendar")).toBe(false);
  });

  it("enables calendar and customers for all roles", () => {
    const enabled = DASHBOARD_NAV.filter((item) => item.enabled);
    expect(enabled.map((item) => item.key)).toContain("calendar");
    expect(enabled.map((item) => item.key)).toContain("customers");
  });
});
