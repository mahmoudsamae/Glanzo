import { AdminShell } from "@/components/layout/admin-shell";
import { signOutFromPlatformAdmin } from "@/server/modules/auth/actions";
import { getActor } from "@/server/modules/auth/get-actor";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePlatformAdmin();
  const actor = await getActor();

  return (
    <AdminShell adminEmail={actor?.email ?? "admin"} signOutAction={signOutFromPlatformAdmin}>
      {children}
    </AdminShell>
  );
}
