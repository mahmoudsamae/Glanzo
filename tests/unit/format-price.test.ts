import { describe, expect, it } from "vitest";

import { formatPriceCents } from "@/lib/minisite/format-price";

describe("formatPriceCents", () => {
  it("formats whole euros", () => {
    expect(formatPriceCents(2500)).toMatch(/25/);
  });

  it("formats cents", () => {
    expect(formatPriceCents(1999)).toMatch(/19,99|19.99/);
  });

  it("formats zero", () => {
    expect(formatPriceCents(0)).toMatch(/0/);
  });
});
