import { SettingsNav } from "@/features/settings";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireOwnerDashboardAccess();

  return (
    <div className="mx-auto w-full max-w-3xl px-[var(--space-4)] py-[var(--space-8)]">
      <header className="mb-[var(--space-6)]">
        <h1 className="font-display text-2xl text-[var(--text-0)]">Einstellungen</h1>
      </header>
      <SettingsNav />
      {children}
    </div>
  );
}
