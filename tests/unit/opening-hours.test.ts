import { describe, expect, it } from "vitest";

import {
  DEFAULT_ONBOARDING_OPENING_HOURS,
  openingHoursSchema,
} from "@/lib/validations/shop";

describe("openingHoursSchema", () => {
  it("accepts default onboarding hours", () => {
    const result = openingHoursSchema.safeParse(DEFAULT_ONBOARDING_OPENING_HOURS);
    expect(result.success).toBe(true);
  });

  it("rejects close before open", () => {
    const result = openingHoursSchema.safeParse({
      ...DEFAULT_ONBOARDING_OPENING_HOURS,
      tue: { open: "18:00", close: "09:00" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects close equal to open", () => {
    const result = openingHoursSchema.safeParse({
      ...DEFAULT_ONBOARDING_OPENING_HOURS,
      wed: { open: "10:00", close: "10:00" },
    });
    expect(result.success).toBe(false);
  });

  it("allows closed days as null", () => {
    const result = openingHoursSchema.safeParse({
      ...DEFAULT_ONBOARDING_OPENING_HOURS,
      mon: null,
      sun: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid time format", () => {
    const result = openingHoursSchema.safeParse({
      ...DEFAULT_ONBOARDING_OPENING_HOURS,
      fri: { open: "9:00", close: "19:00" },
    });
    expect(result.success).toBe(false);
  });
});
