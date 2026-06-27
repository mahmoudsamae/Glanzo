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
  SHOP_SUSPENDED: "Dieser Salon nimmt derzeit keine Buchungen entgegen.",
  SLOT_TAKEN: "Dieser Termin ist nicht mehr verfügbar.",
  PHONE_LIMIT: "Zu viele anstehende Buchungen für diese Telefonnummer.",
  RATE_LIMITED: "Zu viele Buchungsversuche. Bitte später erneut versuchen.",
  TOO_LATE: "Das Stornierungsfenster für diesen Termin ist abgelaufen.",
  INVALID_INPUT: "Bitte Buchungsdaten prüfen und erneut versuchen.",
  BOOKING_NOT_FOUND: "Buchung nicht gefunden.",
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
