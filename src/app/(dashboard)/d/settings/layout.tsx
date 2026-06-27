import { SettingsNav } from "@/features/settings";
import { DashboardPage, DashboardPageHeader } from "@/components/dashboard";
import { requireOwnerDashboardNavKey } from "@/server/modules/shops/create-shop.service";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireOwnerDashboardNavKey("settings");

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Salon einrichten"
        title="Einstellungen"
        subtitle="Öffnungszeiten, Website-Bereiche, Buchungsregeln und Benachrichtigungen."
      />
      <SettingsNav />
      {children}
    </DashboardPage>
  );
}
