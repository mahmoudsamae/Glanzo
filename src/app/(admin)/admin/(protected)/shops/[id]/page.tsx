import { notFound } from "next/navigation";

import { AdminShopDetail } from "@/features/admin-ui";
import { loadPlatformShop } from "@/server/modules/platform/platform.service";

type ShopDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminShopDetailPage({ params }: ShopDetailPageProps) {
  const { id } = await params;

  let shop;
  try {
    shop = await loadPlatformShop(id);
  } catch {
    notFound();
  }

  return <AdminShopDetail shop={shop} />;
}
