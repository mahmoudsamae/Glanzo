import { describe, expect, it } from "vitest";

import {
  BARBER_FIRST,
  BOOKING_OPEN_PARAM,
  bookingStepProgress,
  buildBookingSearchParams,
  parseBookingUrlState,
  previousBookingSearchParams,
} from "@/lib/booking/booking-steps";

describe("parseBookingUrlState", () => {
  it("returns closed when book param missing", () => {
    const state = parseBookingUrlState(new URLSearchParams(""));
    expect(state.open).toBe(false);
    expect(state.step).toBe("service");
  });

  it("derives steps from params", () => {
    expect(
      parseBookingUrlState(new URLSearchParams(`${BOOKING_OPEN_PARAM}=1`)).step,
    ).toBe("service");
    expect(
      parseBookingUrlState(
        new URLSearchParams(`${BOOKING_OPEN_PARAM}=1&service=a`),
      ).step,
    ).toBe("barber");
    expect(
      parseBookingUrlState(
        new URLSearchParams(`${BOOKING_OPEN_PARAM}=1&service=a`),
        { autoAssignBarber: true },
      ).step,
    ).toBe("slot");
    expect(
      parseBookingUrlState(
        new URLSearchParams(`${BOOKING_OPEN_PARAM}=1&service=a&barber=${BARBER_FIRST}`),
      ).step,
    ).toBe("slot");
    expect(
      parseBookingUrlState(
        new URLSearchParams(
          `${BOOKING_OPEN_PARAM}=1&service=a&barber=b&slot=2025-06-10T10:00:00+02:00`,
        ),
      ).step,
    ).toBe("details");
  });
});

describe("bookingStepProgress", () => {
  it("maps to CutLine thirds", () => {
    expect(bookingStepProgress("service")).toBeCloseTo(1 / 3);
    expect(bookingStepProgress("barber")).toBeCloseTo(2 / 3);
    expect(bookingStepProgress("slot")).toBe(1);
    expect(bookingStepProgress("details")).toBe(1);
  });
});

describe("previousBookingSearchParams", () => {
  it("walks back one param at a time", () => {
    const start = new URLSearchParams(
      `${BOOKING_OPEN_PARAM}=1&service=s&barber=${BARBER_FIRST}&slot=t`,
    );
    const afterSlot = previousBookingSearchParams(start);
    expect(afterSlot.get("slot")).toBeNull();
    expect(afterSlot.get("barber")).toBe(BARBER_FIRST);

    const afterBarber = previousBookingSearchParams(afterSlot);
    expect(afterBarber.get("barber")).toBeNull();

    const afterService = previousBookingSearchParams(afterBarber);
    expect(afterService.get("service")).toBeNull();
    expect(afterService.get(BOOKING_OPEN_PARAM)).toBe("1");

    const closed = previousBookingSearchParams(afterService);
    expect(closed.get(BOOKING_OPEN_PARAM)).toBeNull();
  });
});

describe("buildBookingSearchParams", () => {
  it("clears downstream params when service changes", () => {
    const base = new URLSearchParams(
      `${BOOKING_OPEN_PARAM}=1&service=old&barber=x&slot=y`,
    );
    const next = buildBookingSearchParams(base, { serviceId: "new" });
    expect(next.get("service")).toBe("new");
    expect(next.get("barber")).toBeNull();
    expect(next.get("slot")).toBeNull();
  });

  it("auto-selects barber when building service params", () => {
    const next = buildBookingSearchParams(
      new URLSearchParams(`${BOOKING_OPEN_PARAM}=1`),
      { serviceId: "svc-1" },
      { autoAssignBarber: true },
    );
    expect(next.get("service")).toBe("svc-1");
    expect(next.get("barber")).toBe(BARBER_FIRST);
  });
});
