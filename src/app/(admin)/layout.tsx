import { AdminShell } from "@/components/layout/admin-shell";
import { getActor } from "@/server/modules/auth/get-actor";
import { signOut } from "@/server/modules/auth/actions";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePlatformAdmin();
  const actor = await getActor();

  return (
    <AdminShell adminEmail={actor?.email ?? "admin"} signOutAction={signOut}>
      {children}
    </AdminShell>
  );
}
