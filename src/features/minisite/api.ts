"use server";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import {
  loadMinisiteEditorData,
  updateMinisite,
} from "@/server/modules/minisite/minisite.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

async function ownerContext() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership || membership.role !== "owner") {
    return null;
  }
  return { actor, shopId: membership.shopId };
}

export async function fetchMinisiteEditorAction() {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const data = await loadMinisiteEditorData(ctx.actor, ctx.shopId);
  if (!data) {
    return { ok: false as const, code: "NOT_FOUND" };
  }
  return { ok: true as const, data };
}

export async function saveMinisiteAction(input: unknown) {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const result = await updateMinisite(ctx.actor, ctx.shopId, input);
  if (!result.ok && result.code === "MANAGED") {
    return { ok: false as const, code: "MANAGED" as const };
  }
  return result;
}
