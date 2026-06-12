export const BOOKING_ERROR_CODES = [
  "SHOP_SUSPENDED",
  "SLOT_TAKEN",
  "PHONE_LIMIT",
  "RATE_LIMITED",
  "TOO_LATE",
  "INVALID_INPUT",
  "BOOKING_NOT_FOUND",
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number];

const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  SHOP_SUSPENDED: "This shop is not accepting bookings right now.",
  SLOT_TAKEN: "That time slot is no longer available.",
  PHONE_LIMIT: "Too many upcoming bookings for this phone number.",
  RATE_LIMITED: "Too many booking attempts. Try again later.",
  TOO_LATE: "Cancellation window has passed for this appointment.",
  INVALID_INPUT: "Check your booking details and try again.",
  BOOKING_NOT_FOUND: "Booking not found.",
};

export function bookingErrorMessage(code: BookingErrorCode): string {
  return BOOKING_ERROR_MESSAGES[code];
}

/** Map Supabase/Postgres RPC exception text to a typed booking error code. */
export function mapBookingRpcError(message: string): BookingErrorCode {
  const upper = message.toUpperCase();

  for (const code of BOOKING_ERROR_CODES) {
    if (upper.includes(code)) {
      return code;
    }
  }

  return "INVALID_INPUT";
}

export function isBookingErrorCode(value: string): value is BookingErrorCode {
  return (BOOKING_ERROR_CODES as readonly string[]).includes(value);
}
