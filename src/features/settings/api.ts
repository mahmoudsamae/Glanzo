"use server";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { getActor } from "@/server/modules/auth/get-actor";
import {
  loadNotificationSettings,
  updateRemindersEnabled,
} from "@/server/modules/notifications/notification-settings.service";
import {
  loadShopSettings,
  updateShopSettings,
  type ShopSettingsInput,
} from "@/server/modules/shops/shop-settings.service";
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

export async function fetchShopSettingsAction() {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const data = await loadShopSettings(ctx.actor, ctx.shopId);
  return { ok: true as const, data };
}

export async function updateShopSettingsAction(input: ShopSettingsInput) {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return updateShopSettings(ctx.actor, ctx.shopId, input);
}

export async function fetchNotificationSettingsAction() {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const data = await loadNotificationSettings(ctx.actor, ctx.shopId);
  return { ok: true as const, data };
}

export async function updateRemindersEnabledAction(input: { remindersEnabled: boolean }) {
  const ctx = await ownerContext();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return updateRemindersEnabled(ctx.actor, ctx.shopId, input);
}
