import { ServicesBoard } from "@/features/services";
import { loadServicesCatalog } from "@/server/modules/services/services.loader";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function ServicesPage() {
  const { actor, shopId } = await requireOwnerDashboardAccess();
  const { services, barbers } = await loadServicesCatalog(actor, shopId);

  return <ServicesBoard shopId={shopId} initialServices={services} barbers={barbers} />;
}
