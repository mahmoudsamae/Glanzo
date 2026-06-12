import { Suspense } from "react";

import { CalendarSkeleton, parseCalendarSearchParams } from "@/features/calendar";
import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";
import { loadServicesCatalog } from "@/server/modules/services/services.loader";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

import { CalendarClient } from "./calendar-client";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  await requireDashboardAccess();

  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }

  const timezone = membership.shopTimezone ?? "Europe/Berlin";
  const today = dateInShopTimezone(new Date(), timezone);
  const resolvedSearchParams = await searchParams;
  const urlState = parseCalendarSearchParams(resolvedSearchParams, {
    date: today,
    view: "day",
    barber: membership.role === "barber" ? membership.id : undefined,
  });

  const { services, barbers } = await loadServicesCatalog(actor, membership.shopId);

  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarClient
        shopId={membership.shopId}
        shopSlug={membership.shopSlug}
        role={membership.role}
        actorMembershipId={membership.id}
        initialDate={urlState.date}
        initialView={urlState.view}
        initialBarberId={urlState.barber}
        services={services}
        serviceBarbers={barbers}
      />
    </Suspense>
  );
}
