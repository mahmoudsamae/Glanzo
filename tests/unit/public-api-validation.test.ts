import { describe, expect, it } from "vitest";

import {
  availabilityQuerySchema,
  bookingTokenParamSchema,
  createBookingBodySchema,
  idempotencyKeyHeaderSchema,
  rescheduleBookingBodySchema,
} from "@/lib/validations/booking";
import { walkInAppointmentInputSchema } from "@/lib/validations/appointment";

describe("idempotencyKeyHeaderSchema", () => {
  it("accepts UUID keys", () => {
    expect(
      idempotencyKeyHeaderSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success,
    ).toBe(true);
  });

  it("accepts opaque keys with at least 16 characters", () => {
    expect(idempotencyKeyHeaderSchema.safeParse("client-key-123456").success).toBe(true);
  });

  it("rejects short keys", () => {
    expect(idempotencyKeyHeaderSchema.safeParse("short").success).toBe(false);
  });

  it("rejects missing header value", () => {
    expect(idempotencyKeyHeaderSchema.safeParse("").success).toBe(false);
  });
});

describe("availabilityQuerySchema", () => {
  it("parses serviceId + date", () => {
    const parsed = availabilityQuerySchema.safeParse({
      serviceId: "f0000000-0000-4000-8000-000000000001",
      date: "2027-03-15",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    expect(
      availabilityQuerySchema.safeParse({
        serviceId: "f0000000-0000-4000-8000-000000000001",
        date: "03/15/2027",
      }).success,
    ).toBe(false);
  });
});

describe("createBookingBodySchema", () => {
  it("requires name, phone, and offset datetime", () => {
    const parsed = createBookingBodySchema.safeParse({
      serviceId: "f0000000-0000-4000-8000-000000000001",
      startsAt: "2027-03-15T08:00:00.000Z",
      name: "Alex Guest",
      phone: "01701234567",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("bookingTokenParamSchema", () => {
  it("requires at least 32 characters", () => {
    expect(bookingTokenParamSchema.safeParse("a".repeat(32)).success).toBe(true);
    expect(bookingTokenParamSchema.safeParse("short").success).toBe(false);
  });
});

describe("rescheduleBookingBodySchema", () => {
  it("requires startsAt datetime", () => {
    expect(
      rescheduleBookingBodySchema.safeParse({ startsAt: "2027-03-15T09:00:00.000Z" }).success,
    ).toBe(true);
  });
});

describe("walkInAppointmentInputSchema", () => {
  it("allows anonymous walk-in without customer fields", () => {
    expect(
      walkInAppointmentInputSchema.safeParse({
        serviceId: "f0000000-0000-4000-8000-000000000001",
        membershipId: "d0000000-0000-4000-8000-000000000003",
        startsAt: "2027-03-15T08:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("requires name and phone together", () => {
    expect(
      walkInAppointmentInputSchema.safeParse({
        serviceId: "f0000000-0000-4000-8000-000000000001",
        membershipId: "d0000000-0000-4000-8000-000000000003",
        startsAt: "2027-03-15T08:00:00.000Z",
        name: "Walk-in Guest",
      }).success,
    ).toBe(false);
  });
});
