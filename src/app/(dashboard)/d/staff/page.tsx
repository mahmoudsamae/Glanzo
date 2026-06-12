import { StaffBoard } from "@/features/staff";
import { getActor } from "@/server/modules/auth/get-actor";
import { getStaffPageData } from "@/server/modules/staff/staff.service";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function StaffPage() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
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
