import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { signOut } from "@/server/modules/auth/actions";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardQueryProvider } from "@/components/layout/query-provider.client";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireDashboardAccess();

  const actor = await getActor();
  const activeMembership = getActiveMembership(actor?.memberships ?? []);

  return (
    <DashboardQueryProvider>
      <AppShell
        shopName={activeMembership?.shopName ?? "Your shop"}
        shopSlug={activeMembership?.shopSlug ?? ""}
        role={activeMembership?.role ?? "owner"}
        displayName={actor?.profile.display_name.trim() || "Staff"}
        isPlatformAdmin={actor?.isPlatformAdmin ?? false}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </DashboardQueryProvider>
  );
}
