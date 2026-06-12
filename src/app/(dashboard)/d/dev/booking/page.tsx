import { notFound } from "next/navigation";

import { DevBookingPanel } from "@/features/booking";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { serverEnv } from "@/lib/env";
import { loadDevBookingFixtures } from "@/server/modules/booking/dev-booking.loader";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export const dynamic = "force-dynamic";

export default async function DevBookingPage() {
  if (serverEnv.NODE_ENV === "production") {
    notFound();
  }

  const { actor, shopId } = await requireOwnerDashboardAccess();
  const membership = getActiveMembership(actor.memberships);
  if (!membership) {
    notFound();
  }

  const fixtures = await loadDevBookingFixtures(shopId);
  if (!fixtures) {
    notFound();
  }

  return (
    <DevBookingPanel
      shopSlug={membership.shopSlug}
      serviceId={fixtures.serviceId}
      membershipId={fixtures.membershipId}
    />
  );
}
