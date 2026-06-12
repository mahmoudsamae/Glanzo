import { describe, expect, it } from "vitest";

import { isValidCronSecret } from "@/lib/notifications/cron-auth";

describe("CRON_SECRET auth", () => {
  const secret = "test-cron-secret-32chars-min";

  it("accepts matching secret", () => {
    expect(isValidCronSecret(secret, secret)).toBe(true);
  });

  it("rejects missing or wrong secret", () => {
    expect(isValidCronSecret(null, secret)).toBe(false);
    expect(isValidCronSecret("wrong-secret-value-here-xx", secret)).toBe(false);
  });

  it("rejects different-length values without throwing", () => {
    expect(isValidCronSecret("short", secret)).toBe(false);
  });
});
