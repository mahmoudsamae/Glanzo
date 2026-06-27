import { Suspense } from "react";

import { CustomersSkeleton } from "@/features/customers";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { requireDashboardNavKey } from "@/server/modules/shops/create-shop.service";

import { ProfileClient } from "./profile-client";

type CustomerProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  await requireDashboardNavKey("customers");
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  const { id } = await params;
  if (!actor || !membership) {
    return null;
  }

  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <ProfileClient shopId={membership.shopId} customerId={id} role={membership.role} />
    </Suspense>
  );
}
