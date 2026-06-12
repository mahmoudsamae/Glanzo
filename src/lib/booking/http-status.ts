import type { BookingErrorCode } from "@/lib/booking/errors";

/**
 * HTTP status codes for public booking API errors.
 * INVALID_INPUT → 400 · BOOKING_NOT_FOUND → 404 · TOO_LATE/SLOT_TAKEN → 409
 * · PHONE_LIMIT/RATE_LIMITED → 429 · SHOP_SUSPENDED → 403
 */
export const BOOKING_HTTP_STATUS: Record<BookingErrorCode, number> = {
  INVALID_INPUT: 400,
  BOOKING_NOT_FOUND: 404,
  TOO_LATE: 409,
  SLOT_TAKEN: 409,
  PHONE_LIMIT: 429,
  RATE_LIMITED: 429,
  SHOP_SUSPENDED: 403,
};

export function bookingHttpStatus(code: BookingErrorCode): number {
  return BOOKING_HTTP_STATUS[code];
}
