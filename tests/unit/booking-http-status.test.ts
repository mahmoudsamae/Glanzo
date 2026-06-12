import { describe, expect, it } from "vitest";

import { BOOKING_HTTP_STATUS, bookingHttpStatus } from "@/lib/booking/http-status";

describe("bookingHttpStatus", () => {
  it("maps INVALID_INPUT to 400", () => {
    expect(bookingHttpStatus("INVALID_INPUT")).toBe(400);
  });

  it("maps BOOKING_NOT_FOUND to 404", () => {
    expect(bookingHttpStatus("BOOKING_NOT_FOUND")).toBe(404);
  });

  it("maps TOO_LATE and SLOT_TAKEN to 409", () => {
    expect(bookingHttpStatus("TOO_LATE")).toBe(409);
    expect(bookingHttpStatus("SLOT_TAKEN")).toBe(409);
  });

  it("maps PHONE_LIMIT and RATE_LIMITED to 429", () => {
    expect(bookingHttpStatus("PHONE_LIMIT")).toBe(429);
    expect(bookingHttpStatus("RATE_LIMITED")).toBe(429);
  });

  it("maps SHOP_SUSPENDED to 403", () => {
    expect(bookingHttpStatus("SHOP_SUSPENDED")).toBe(403);
  });

  it("documents every booking error code", () => {
    expect(Object.keys(BOOKING_HTTP_STATUS)).toHaveLength(7);
  });
});
