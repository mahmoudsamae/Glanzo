"use server";

import { z } from "zod";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import {
  createServiceInputSchema,
  updateServiceInputSchema,
} from "@/lib/validations/service";
import { getActor } from "@/server/modules/auth/get-actor";
import { loadServicesCatalog } from "@/server/modules/services/services.loader";
import {
  archiveService,
  createService,
  reorderServices,
  updateService,
} from "@/server/modules/services/services.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

const reorderSchema = z.object({
  shopId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

async function ownerActor() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership || membership.role !== "owner") {
    return null;
  }
  return { actor, shopId: membership.shopId };
}

export async function fetchServicesCatalogAction() {
  const ctx = await ownerActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const data = await loadServicesCatalog(ctx.actor, ctx.shopId);
  return { ok: true as const, data };
}

export async function createServiceAction(input: unknown) {
  const ctx = await ownerActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = createServiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return createService(ctx.actor, ctx.shopId, parsed.data);
}

export async function updateServiceAction(input: unknown) {
  const ctx = await ownerActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = updateServiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return updateService(ctx.actor, ctx.shopId, parsed.data);
}

export async function archiveServiceAction(serviceId: string) {
  const ctx = await ownerActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return archiveService(ctx.actor, ctx.shopId, serviceId);
}

export async function reorderServicesAction(input: unknown) {
  const ctx = await ownerActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  if (parsed.data.shopId !== ctx.shopId) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return reorderServices(ctx.actor, ctx.shopId, parsed.data.orderedIds);
}
