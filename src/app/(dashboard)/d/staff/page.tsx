import { StaffBoard } from "@/features/staff";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import {
  isDashboardNavKeyAllowed,
  normalizeDashboardNavKeys,
} from "@/lib/dashboard/nav-config";
import { getActor } from "@/server/modules/auth/get-actor";
import { getStaffPageData } from "@/server/modules/staff/staff.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }

  if (membership.role === "owner") {
    const allowedNavKeys = normalizeDashboardNavKeys(membership.dashboardNavKeys);
    if (!isDashboardNavKeyAllowed("staff", allowedNavKeys)) {
      redirect("/d");
    }
  }

  const result = await getStaffPageData(actor, membership.shopId);
  if (!result.ok) {
    return null;
  }

  if (result.data.role === "owner") {
    return <StaffBoard mode="owner" members={result.data.members} invites={result.data.invites} />;
  }

  return (
    <StaffBoard
      mode="barber"
      membershipId={result.data.membershipId}
      hours={result.data.hours}
      timeOff={result.data.timeOff}
    />
  );
}
