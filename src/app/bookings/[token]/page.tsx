import type { Metadata } from "next";

import { BookingInactive, ManageBookingClient } from "@/features/booking";
import { loadManageBooking } from "@/server/modules/booking/manage-booking.loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Termin verwalten | Glanzo",
};

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const view = await loadManageBooking(token);

  if (view.kind === "inactive") {
    return <BookingInactive />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-[var(--space-4)] py-[var(--space-12)]">
      <ManageBookingClient
        token={view.token}
        booking={view.booking}
        timezone={view.timezone}
        shopSlug={view.shopSlug}
        serviceId={view.serviceId}
        membershipId={view.membershipId}
      />
    </main>
  );
}
