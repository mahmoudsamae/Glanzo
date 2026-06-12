import { describe, expect, it } from "vitest";

import {
  buildCalendarSearchParams,
  parseCalendarSearchParams,
} from "@/features/calendar/url-state";

describe("parseCalendarSearchParams", () => {
  it("uses defaults when params missing", () => {
    const result = parseCalendarSearchParams({}, {
      date: "2026-06-12",
      view: "day",
    });
    expect(result.date).toBe("2026-06-12");
    expect(result.view).toBe("day");
  });

  it("parses valid overrides", () => {
    const result = parseCalendarSearchParams(
      { date: "2026-07-01", view: "week", barber: "d0000000-0000-4000-8000-000000000003" },
      { date: "2026-06-12", view: "day" },
    );
    expect(result.view).toBe("week");
    expect(result.barber).toBe("d0000000-0000-4000-8000-000000000003");
  });

  it("falls back on invalid date", () => {
    const result = parseCalendarSearchParams(
      { date: "bad" },
      { date: "2026-06-12", view: "day" },
    );
    expect(result.date).toBe("2026-06-12");
  });
});

describe("buildCalendarSearchParams", () => {
  it("serializes barber filter", () => {
    const qs = buildCalendarSearchParams({
      date: "2026-06-12",
      view: "day",
      barber: "d0000000-0000-4000-8000-000000000003",
    });
    expect(qs).toContain("barber=");
  });
});
