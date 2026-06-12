import { describe, expect, it } from "vitest";

import { formatHoursTodayLine } from "@/lib/minisite/hours-today";
import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";

describe("formatHoursTodayLine", () => {
  it("returns closed message for null day", () => {
    const line = formatHoursTodayLine(
      { ...DEFAULT_ONBOARDING_OPENING_HOURS, mon: null },
      "Europe/Berlin",
      new Date("2025-06-09T10:00:00Z"),
    );
    expect(line).toBe("Heute geschlossen");
  });

  it("returns open hours for an open day", () => {
    const line = formatHoursTodayLine(
      DEFAULT_ONBOARDING_OPENING_HOURS,
      "Europe/Berlin",
      new Date("2025-06-10T10:00:00Z"),
    );
    expect(line).toContain("Heute");
    expect(line).toContain("09:00");
  });
});
