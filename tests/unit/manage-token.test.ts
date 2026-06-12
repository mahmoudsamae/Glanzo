import { describe, expect, it } from "vitest";

import { generateManageToken } from "@/lib/booking/manage-token";

describe("generateManageToken", () => {
  it("returns 64-char hex (32 bytes)", () => {
    const token = generateManageToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique values", () => {
    expect(generateManageToken()).not.toBe(generateManageToken());
  });
});
