import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireShopOwner } from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";

import { listServiceStaffMembershipIds, listServicesForShop } from "./services.queries";

export type { BarberOption, ServiceCatalogItem };

export async function loadServicesCatalog(actor: Actor, shopId: string) {
  requireShopOwner(actor, shopId);
  const supabase = await createServerSupabaseClient();

  const [services, membershipsResult] = await Promise.all([
    listServicesForShop(supabase, shopId, { includeArchived: false }),
    supabase
      .from("memberships")
      .select(
        `
        id,
        role,
        profile:profiles ( display_name )
      `,
      )
      .eq("shop_id", shopId)
      .is("archived_at", null)
      .eq("role", "barber"),
  ]);

  if (membershipsResult.error) {
    throw membershipsResult.error;
  }

  const barbers: BarberOption[] = (membershipsResult.data ?? []).map((row) => {
    const name = row.profile?.display_name?.trim() || "Barber";
    return {
      membershipId: row.id,
      displayName: name,
      initials: name.slice(0, 2).toUpperCase(),
    };
  });

  const catalog: ServiceCatalogItem[] = await Promise.all(
    services.map(async (service) => ({
      id: service.id,
      name: service.name,
      durationMin: service.duration_min,
      priceCents: service.price_cents,
      showPrice: service.show_price,
      description: service.description,
      imagePath: service.image_path,
      sortOrder: service.sort_order,
      archivedAt: service.archived_at,
      assignedMembershipIds: await listServiceStaffMembershipIds(supabase, shopId, service.id),
    })),
  );

  return { services: catalog, barbers };
}
