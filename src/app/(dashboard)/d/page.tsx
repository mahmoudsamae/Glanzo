import { Suspense } from "react";

import { TodaySkeleton } from "@/features/today";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";
import { loadServicesCatalog } from "@/server/modules/services/services.loader";
import { getShopCalendarContext } from "@/server/modules/appointments/appointments.queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

import { TodayClient } from "./today-client";

export default async function DashboardPage() {
  await requireDashboardAccess();

  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }

  const timezone = membership.shopTimezone ?? "Europe/Berlin";
  const today = dateInShopTimezone(new Date(), timezone);
  const supabase = await createServerSupabaseClient();
  const context = await getShopCalendarContext(supabase, membership.shopId);
  const { barbers } = await loadServicesCatalog(actor, membership.shopId);

  return (
    <Suspense fallback={<TodaySkeleton />}>
      <TodayClient
        shopId={membership.shopId}
        shopSlug={membership.shopSlug}
        date={today}
        timezone={timezone}
        openingHours={context?.openingHours ?? DEFAULT_ONBOARDING_OPENING_HOURS}
        role={membership.role}
        actorMembershipId={membership.id}
        barberDisplayNames={barbers}
      />
    </Suspense>
  );
}
