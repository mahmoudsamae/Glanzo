"use server";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import {
  deleteCustomerSchema,
  updateCustomerNotesSchema,
  upsertCustomerInputSchema,
} from "@/lib/validations/customer";
import { getActor } from "@/server/modules/auth/get-actor";
import {
  createManualCustomer,
  deleteCustomer,
  fetchCustomerProfile,
  fetchCustomersList,
  updateCustomerNotes,
} from "@/server/modules/customers/customers.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

async function dashboardActor() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }
  return { actor, shopId: membership.shopId, membership };
}

export async function fetchCustomersListAction(input: {
  search?: string;
  cursor?: string;
}) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return fetchCustomersList(ctx.actor, ctx.shopId, input);
}

export async function fetchCustomerProfileAction(customerId: string) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return fetchCustomerProfile(ctx.actor, ctx.shopId, customerId);
}

export async function updateCustomerNotesAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = updateCustomerNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return updateCustomerNotes(ctx.actor, ctx.shopId, parsed.data);
}

export async function createManualCustomerAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = upsertCustomerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return createManualCustomer(ctx.actor, ctx.shopId, parsed.data);
}

export async function deleteCustomerAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = deleteCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return deleteCustomer(ctx.actor, ctx.shopId, parsed.data);
}
