"use client";

import { useEffect, useState } from "react";

import { formatBookingSummaryDate, formatSlotTime } from "@/lib/booking/slot-days";
import {
  CUSTOMER_BOOKING_SAVED_EVENT,
  readActiveSavedBookingForShop,
  type SavedCustomerBooking,
} from "@/lib/booking/customer-saved-bookings";
import { cn } from "@/lib/utils";

type CustomerBookingAccessProps = {
  shopSlug: string;
  timezone: string;
  className?: string;
};

export function CustomerBookingAccess({
  shopSlug,
  timezone,
  className,
}: CustomerBookingAccessProps) {
  const [booking, setBooking] = useState<SavedCustomerBooking | null>(null);

  useEffect(() => {
    function sync() {
      setBooking(readActiveSavedBookingForShop(localStorage, shopSlug));
    }

    sync();
    window.addEventListener(CUSTOMER_BOOKING_SAVED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CUSTOMER_BOOKING_SAVED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [shopSlug]);

  if (!booking) {
    return null;
  }

  const label = `${formatBookingSummaryDate(booking.startsAt, timezone)}, ${formatSlotTime(booking.startsAt, timezone)} Uhr`;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[25] flex justify-center px-[var(--space-4)]",
        "bottom-[calc(6.75rem+env(safe-area-inset-bottom))] lg:bottom-[var(--space-6)]",
        className,
      )}
    >
      <a
        href={booking.manageUrl}
        className="pointer-events-auto inline-flex max-w-lg items-center gap-[var(--space-2)] rounded-full border border-[color:var(--ms-accent)] bg-[color:var(--ms-bg-elevated)] px-[var(--space-4)] py-[var(--space-2)] text-sm font-medium text-[color:var(--ms-text)] shadow-lg backdrop-blur-sm transition-opacity hover:opacity-90"
      >
        <span className="text-[color:var(--ms-accent-on-bg)]">Dein Termin</span>
        <span className="text-[color:var(--ms-text-muted)]">·</span>
        <span className="truncate">{label}</span>
      </a>
    </div>
  );
}
