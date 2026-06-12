import { describe, expect, it } from "vitest";

import { centsToEurDisplay, centsToEurInput, eurInputToCents } from "@/lib/money/price";

describe("price cents ↔ EUR", () => {
  it("parses comma and dot decimals", () => {
    expect(eurInputToCents("25,50")).toBe(2550);
    expect(eurInputToCents("25.50")).toBe(2550);
    expect(eurInputToCents("10")).toBe(1000);
  });

  it("rejects invalid input", () => {
    expect(eurInputToCents("abc")).toBeNull();
    expect(eurInputToCents("-1")).toBeNull();
  });

  it("formats for display and input", () => {
    expect(centsToEurDisplay(2550)).toContain("25");
    expect(centsToEurInput(2550)).toBe("25,50");
  });
});
