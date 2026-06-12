import { AdminOverview } from "@/features/admin";
import { loadPlatformOverview, loadPlatformShopList } from "@/server/modules/platform/platform.service";

export default async function AdminOverviewPage() {
  const [overview, suspended] = await Promise.all([
    loadPlatformOverview(),
    loadPlatformShopList({ status: "suspended" }),
  ]);

  return <AdminOverview overview={overview} suspendedShops={suspended.items} />;
}
