import { AdminShopsList } from "@/features/admin-ui";
import { loadPlatformShopList } from "@/server/modules/platform/platform.service";

type ShopsPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminShopsPage({ searchParams }: ShopsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const status = params.status === "active" || params.status === "suspended" ? params.status : null;
  const list = await loadPlatformShopList({ search: search || undefined, status });

  return (
    <AdminShopsList
      initialItems={list.items}
      initialNextCursor={list.next_cursor ?? null}
      initialSearch={search}
      initialStatus={status}
    />
  );
}
