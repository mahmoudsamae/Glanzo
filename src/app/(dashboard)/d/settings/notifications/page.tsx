import { NotificationSettingsForm, NotificationTemplatePreviews } from "@/features/settings";
import { serverEnv } from "@/lib/env";
import { loadNotificationSettings } from "@/server/modules/notifications/notification-settings.service";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function NotificationSettingsPage() {
  const { actor, shopId } = await requireOwnerDashboardAccess();
  const settings = await loadNotificationSettings(actor, shopId);

  return (
    <div className="space-y-[var(--space-10)]">
      <NotificationSettingsForm
        initial={settings}
        senderFrom={serverEnv.EMAIL_FROM}
      />
      <NotificationTemplatePreviews />
    </div>
  );
}
