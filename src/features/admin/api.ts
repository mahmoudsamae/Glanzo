"use server";

import {
  createPlatformOwnerInvite,
  createPlatformShop,
  loadPlatformOverview,
  loadPlatformShop,
  loadPlatformShopList,
  loadPlatformShopToday,
  setPlatformShopStatus,
} from "@/server/modules/platform/platform.service";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";
import { checkShopSlugAvailability } from "@/server/modules/shops/create-shop.service";

async function adminGate() {
  await requirePlatformAdmin();
}

export async function fetchPlatformOverviewAction() {
  await adminGate();
  const data = await loadPlatformOverview();
  const suspended = await loadPlatformShopList({ status: "suspended" });
  return { ok: true as const, data, suspendedShops: suspended.items };
}

export async function fetchPlatformShopListAction(params: {
  search?: string;
  status?: string | null;
  cursor?: string | null;
}) {
  await adminGate();
  const data = await loadPlatformShopList(params);
  return { ok: true as const, data };
}

export async function fetchPlatformShopAction(shopId: string) {
  await adminGate();
  const data = await loadPlatformShop(shopId);
  return { ok: true as const, data };
}

export async function fetchPlatformShopTodayAction(shopId: string) {
  await adminGate();
  const data = await loadPlatformShopToday(shopId);
  return { ok: true as const, data };
}

export async function setPlatformShopStatusAction(
  shopId: string,
  status: "active" | "suspended",
  reason: string,
) {
  await adminGate();
  return setPlatformShopStatus(shopId, status, reason);
}

export async function createPlatformShopAction(input: unknown) {
  await adminGate();
  return createPlatformShop(input);
}

export async function createPlatformOwnerInviteAction(shopId: string, ownerEmail: string) {
  await adminGate();
  return createPlatformOwnerInvite(shopId, ownerEmail);
}

export async function checkPlatformShopSlugAction(slug: string) {
  await adminGate();
  return checkShopSlugAvailability(slug);
}
