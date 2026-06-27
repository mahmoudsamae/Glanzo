import { notFound } from "next/navigation";

import { AdminMinisiteEditor } from "./admin-minisite-editor.client";
import { loadMinisiteEditorDataForPlatformAdmin } from "@/server/modules/minisite/minisite.service";
import { loadPlatformShop } from "@/server/modules/platform/platform.service";

type AdminShopMinisitePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminShopMinisitePage({ params }: AdminShopMinisitePageProps) {
  const { id } = await params;

  let shop;
  try {
    shop = await loadPlatformShop(id);
  } catch {
    notFound();
  }

  const data = await loadMinisiteEditorDataForPlatformAdmin(id);
  if (!data) {
    notFound();
  }

  return <AdminMinisiteEditor initial={data} shopId={id} shopName={shop.name} />;
}
