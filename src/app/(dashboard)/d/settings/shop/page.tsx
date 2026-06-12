import { ShopSettingsForm } from "@/features/settings";
import { loadShopSettings } from "@/server/modules/shops/shop-settings.service";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function ShopSettingsPage() {
  const { actor, shopId } = await requireOwnerDashboardAccess();
  const shop = await loadShopSettings(actor, shopId);
  return (
    <div className="space-y-[var(--space-8)]">
      <ShopSettingsForm shop={shop} />
    </div>
  );
}
