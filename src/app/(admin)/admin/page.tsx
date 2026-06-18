import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { AdminOverview, PlatformAdminLoginForm } from "@/features/admin";
import { signOutFromPlatformAdmin, loginPlatformAdmin } from "@/server/modules/auth/actions";
import { getActor } from "@/server/modules/auth/get-actor";
import { resolvePostAuthRedirect } from "@/server/modules/auth/get-actor-state";
import { loadPlatformOverview, loadPlatformShopList } from "@/server/modules/platform/platform.service";

export default async function AdminEntryPage() {
  const actor = await getActor();

  if (!actor) {
    return <PlatformAdminLoginForm loginAction={loginPlatformAdmin} />;
  }

  if (!actor.isPlatformAdmin) {
    redirect(resolvePostAuthRedirect(actor));
  }

  const [overview, suspended] = await Promise.all([
    loadPlatformOverview(),
    loadPlatformShopList({ status: "suspended" }),
  ]);

  return (
    <AdminShell adminEmail={actor.email ?? "admin"} signOutAction={signOutFromPlatformAdmin}>
      <AdminOverview overview={overview} suspendedShops={suspended.items} />
    </AdminShell>
  );
}
