import { describe, expect, it } from "vitest";

import {
  bookingErrorMessage,
  isBookingErrorCode,
  mapBookingRpcError,
} from "@/lib/booking/errors";

describe("mapBookingRpcError", () => {
  it("maps SHOP_SUSPENDED from postgres exception text", () => {
    expect(mapBookingRpcError('ERROR: SHOP_SUSPENDED')).toBe("SHOP_SUSPENDED");
  });

  it("maps SLOT_TAKEN from exclusion violation message", () => {
    expect(mapBookingRpcError("duplicate key SLOT_TAKEN conflict")).toBe("SLOT_TAKEN");
  });

  it("maps PHONE_LIMIT", () => {
    expect(mapBookingRpcError("PHONE_LIMIT exceeded")).toBe("PHONE_LIMIT");
  });

  it("maps RATE_LIMITED", () => {
    expect(mapBookingRpcError("RATE_LIMITED")).toBe("RATE_LIMITED");
  });

  it("maps TOO_LATE", () => {
    expect(mapBookingRpcError("TOO_LATE for cancellation")).toBe("TOO_LATE");
  });

  it("maps BOOKING_NOT_FOUND", () => {
    expect(mapBookingRpcError("BOOKING_NOT_FOUND")).toBe("BOOKING_NOT_FOUND");
  });

  it("falls back to INVALID_INPUT for unknown errors", () => {
    expect(mapBookingRpcError("relation does not exist")).toBe("INVALID_INPUT");
  });
});

describe("bookingErrorMessage", () => {
  it("returns user-safe copy for each code", () => {
    expect(bookingErrorMessage("SLOT_TAKEN")).toMatch(/no longer available/i);
    expect(bookingErrorMessage("TOO_LATE")).toMatch(/cancellation window/i);
  });

  it("type guard recognizes booking codes", () => {
    expect(isBookingErrorCode("PHONE_LIMIT")).toBe(true);
    expect(isBookingErrorCode("UNKNOWN")).toBe(false);
  });
});
