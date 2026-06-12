import type { BookingErrorCode } from "@/lib/booking/errors";

const GERMAN_BOOKING_ERRORS: Partial<Record<BookingErrorCode, string>> = {
  SHOP_SUSPENDED: "Online-Buchung ist derzeit pausiert.",
  SLOT_TAKEN: "Gerade vergeben — nächste freie Zeiten:",
  PHONE_LIMIT: "Zu viele Buchungen für diese Nummer. Bitte ruf im Laden an.",
  RATE_LIMITED: "Zu viele Versuche. Bitte warte einen Moment.",
  INVALID_INPUT: "Bitte prüfe deine Angaben und versuche es erneut.",
};

export function bookingErrorMessageDe(code: BookingErrorCode): string {
  return GERMAN_BOOKING_ERRORS[code] ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
}
