import { SettingsNav } from "@/features/settings";
import { DashboardPage, DashboardPageHeader } from "@/components/dashboard";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireOwnerDashboardAccess();

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Shop setup"
        title="Einstellungen"
        subtitle="Öffnungszeiten, Website-Bereiche, Buchungsregeln und Benachrichtigungen."
      />
      <SettingsNav />
      {children}
    </DashboardPage>
  );
}
