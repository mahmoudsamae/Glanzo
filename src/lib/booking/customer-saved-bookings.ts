export const CUSTOMER_SAVED_BOOKINGS_KEY = "glanzo:customer-bookings";
export const CUSTOMER_BOOKING_SAVED_EVENT = "glanzo:customer-booking-saved";

export type SavedCustomerBooking = {
  shopSlug: string;
  shopName: string;
  manageUrl: string;
  startsAt: string;
  endsAt: string;
  serviceName: string;
  customerName: string;
};

function parseSavedBookings(raw: string | null): SavedCustomerBooking[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is SavedCustomerBooking =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as SavedCustomerBooking).shopSlug === "string" &&
        typeof (entry as SavedCustomerBooking).manageUrl === "string" &&
        typeof (entry as SavedCustomerBooking).startsAt === "string" &&
        typeof (entry as SavedCustomerBooking).endsAt === "string",
    );
  } catch {
    return [];
  }
}

export function readSavedCustomerBookings(
  storage: Pick<Storage, "getItem">,
): SavedCustomerBooking[] {
  return parseSavedBookings(storage.getItem(CUSTOMER_SAVED_BOOKINGS_KEY));
}

export function upsertSavedCustomerBooking(
  storage: Pick<Storage, "getItem" | "setItem">,
  booking: SavedCustomerBooking,
): void {
  const existing = readSavedCustomerBookings(storage).filter(
    (entry) => entry.shopSlug !== booking.shopSlug || entry.manageUrl !== booking.manageUrl,
  );
  storage.setItem(CUSTOMER_SAVED_BOOKINGS_KEY, JSON.stringify([booking, ...existing].slice(0, 8)));
}

export function readActiveSavedBookingForShop(
  storage: Pick<Storage, "getItem">,
  shopSlug: string,
  now: Date = new Date(),
): SavedCustomerBooking | null {
  const nowMs = now.getTime();
  return (
    readSavedCustomerBookings(storage).find(
      (entry) => entry.shopSlug === shopSlug && new Date(entry.endsAt).getTime() > nowMs,
    ) ?? null
  );
}

export function notifyCustomerBookingSaved(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(CUSTOMER_BOOKING_SAVED_EVENT));
}

export function removeSavedCustomerBookingByManageUrl(
  storage: Pick<Storage, "getItem" | "setItem">,
  manageUrl: string,
): void {
  const next = readSavedCustomerBookings(storage).filter((entry) => entry.manageUrl !== manageUrl);
  storage.setItem(CUSTOMER_SAVED_BOOKINGS_KEY, JSON.stringify(next));
}
