import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createServiceInputSchema,
  updateServiceInputSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/lib/validations/service";
import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { auditDiff, writeAuditLog } from "@/server/modules/audit/write-audit-log";
import { requireShopOwner } from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

import { getServiceById, listServicesForShop } from "./services.queries";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "UNKNOWN" };

function mapAccessError(error: unknown): ServiceResult<never> {
  if (error instanceof Error && "code" in error) {
    const code = (error as { code: string }).code;
    if (code === "FORBIDDEN" || code === "NOT_MEMBER") {
      return { ok: false, code: "FORBIDDEN" };
    }
  }
  return { ok: false, code: "UNKNOWN" };
}

export async function getServicesCatalog(actor: Actor, shopId: string) {
  requireShopOwner(actor, shopId);
  const supabase = await createServerSupabaseClient();
  const services = await listServicesForShop(supabase, shopId);
  return { ok: true as const, data: services };
}

export async function createService(
  actor: Actor,
  shopId: string,
  input: CreateServiceInput,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  const parsed = createServiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: maxRow } = await supabase
    .from("services")
    .select("sort_order")
    .eq("shop_id", shopId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("services")
    .insert({
      shop_id: shopId,
      name: parsed.data.name,
      duration_min: parsed.data.durationMin,
      price_cents: parsed.data.priceCents,
      sort_order: sortOrder,
    })
    .select("id, name, duration_min, price_cents")
    .single();

  if (error || !data) {
    return { ok: false, code: "UNKNOWN" };
  }

  if (parsed.data.membershipIds.length > 0) {
    const { error: assignError } = await supabase.from("service_staff").insert(
      parsed.data.membershipIds.map((membershipId) => ({
        shop_id: shopId,
        service_id: data.id,
        membership_id: membershipId,
      })),
    );
    if (assignError) {
      return { ok: false, code: "UNKNOWN" };
    }
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "service.created",
    entity: "service",
    entity_id: data.id,
    diff: auditDiff({}, {
      name: data.name,
      duration_min: data.duration_min,
      price_cents: data.price_cents,
    }),
  });

  revalidateShopPublic(shopId);
  return { ok: true, data: { id: data.id } };
}

export async function updateService(
  actor: Actor,
  shopId: string,
  input: UpdateServiceInput,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  const parsed = updateServiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const existing = await getServiceById(supabase, shopId, parsed.data.id);
  if (!existing || existing.archived_at) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const patch: {
    name?: string;
    duration_min?: number;
    sort_order?: number;
    price_cents?: number;
  } = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.durationMin !== undefined) patch.duration_min = parsed.data.durationMin;
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder;

  const priceChanged = parsed.data.priceCents !== undefined && parsed.data.priceCents !== existing.price_cents;
  if (parsed.data.priceCents !== undefined) patch.price_cents = parsed.data.priceCents;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("services")
      .update(patch)
      .eq("shop_id", shopId)
      .eq("id", parsed.data.id);
    if (error) {
      return { ok: false, code: "UNKNOWN" };
    }
  }

  if (parsed.data.membershipIds !== undefined) {
    await supabase
      .from("service_staff")
      .delete()
      .eq("shop_id", shopId)
      .eq("service_id", parsed.data.id);

    if (parsed.data.membershipIds.length > 0) {
      const { error: assignError } = await supabase.from("service_staff").insert(
        parsed.data.membershipIds.map((membershipId) => ({
          shop_id: shopId,
          service_id: parsed.data.id,
          membership_id: membershipId,
        })),
      );
      if (assignError) {
        return { ok: false, code: "UNKNOWN" };
      }
    }
  }

  if (priceChanged) {
    await writeAuditLog({
      shop_id: shopId,
      actor_id: actor.userId,
      actor_type: "user",
      action: "service.price_changed",
      entity: "service",
      entity_id: parsed.data.id,
      diff: auditDiff(
        { price_cents: existing.price_cents },
        { price_cents: parsed.data.priceCents! },
      ),
    });
  }

  revalidateShopPublic(shopId);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function archiveService(
  actor: Actor,
  shopId: string,
  serviceId: string,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  const supabase = await createServerSupabaseClient();
  const existing = await getServiceById(supabase, shopId, serviceId);
  if (!existing || existing.archived_at) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const { error } = await supabase
    .from("services")
    .update({ archived_at: new Date().toISOString() })
    .eq("shop_id", shopId)
    .eq("id", serviceId);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "service.archived",
    entity: "service",
    entity_id: serviceId,
    diff: auditDiff({ archived_at: null }, { archived_at: "now" }),
  });

  revalidateShopPublic(shopId);
  return { ok: true, data: { id: serviceId } };
}

export async function reorderServices(
  actor: Actor,
  shopId: string,
  orderedIds: string[],
): Promise<ServiceResult<{ count: number }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  if (orderedIds.length === 0) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("services")
      .update({ sort_order: index })
      .eq("shop_id", shopId)
      .eq("id", id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { ok: false, code: "UNKNOWN" };
  }

  revalidateShopPublic(shopId);
  return { ok: true, data: { count: orderedIds.length } };
}
