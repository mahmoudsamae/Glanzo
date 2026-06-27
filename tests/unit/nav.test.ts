import { describe, expect, it } from "vitest";

import {
  DASHBOARD_NAV_KEYS,
  isDashboardNavKeyAllowed,
  normalizeDashboardNavKeys,
  sanitizeDashboardNavKeysInput,
} from "@/lib/dashboard/nav-config";
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

  it("filters desktop rail by shop nav config", () => {
    const items = navItemsForSurface("desktop-rail", "owner", ["today", "services", "settings"]);
    expect(items.map((item) => item.key)).toEqual(["today", "services", "settings"]);
  });

  it("filters mobile tabs and keeps More for owner extras", () => {
    const items = navItemsForSurface("mobile", "owner", ["today", "minisite", "settings"]);
    expect(items.map((item) => item.key)).toEqual(["today", "more"]);
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

describe("normalizeDashboardNavKeys", () => {
  it("returns null for empty or missing config", () => {
    expect(normalizeDashboardNavKeys(null)).toBeNull();
    expect(normalizeDashboardNavKeys([])).toBeNull();
  });

  it("keeps only valid keys in canonical order", () => {
    expect(normalizeDashboardNavKeys(["settings", "today", "invalid"])).toEqual([
      "today",
      "settings",
    ]);
  });

  it("sanitizes admin input", () => {
    expect(sanitizeDashboardNavKeysInput(["settings", "today", "bogus"])).toEqual([
      "today",
      "settings",
    ]);
  });

  it("checks allowed keys", () => {
    const allowed = normalizeDashboardNavKeys(["today", "calendar"]);
    expect(isDashboardNavKeyAllowed("calendar", allowed)).toBe(true);
    expect(isDashboardNavKeyAllowed("customers", allowed)).toBe(false);
    expect(isDashboardNavKeyAllowed("customers", null)).toBe(true);
  });

  it("includes all dashboard keys in registry", () => {
    expect(DASHBOARD_NAV_KEYS.length).toBeGreaterThan(0);
  });
});
