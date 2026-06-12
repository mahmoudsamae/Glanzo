import { Suspense } from "react";

import { CustomersSkeleton } from "@/features/customers";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }

  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersClient shopId={membership.shopId} role={membership.role} />
    </Suspense>
  );
}
