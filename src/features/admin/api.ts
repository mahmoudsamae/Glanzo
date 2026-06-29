"use server";

import {
  createPlatformOwnerInvite,
  createPlatformShop,
  loadPlatformOverview,
  loadPlatformShop,
  loadPlatformShopList,
  loadPlatformShopToday,
  setPlatformShopStatus,
  setPlatformShopMinisiteTemplates,
  setPlatformShopTemplate,
  setPlatformShopBookingAutoAssign,
  setPlatformMinisiteManaged,
  setPlatformShopDashboardNav,
} from "@/server/modules/platform/platform.service";
import {
  setPlatformOwnerEmail,
  setPlatformOwnerPassword,
} from "@/server/modules/platform/platform-owner-credentials.service";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";
import { checkShopSlugAvailability } from "@/server/modules/shops/create-shop.service";
import {
  loadMinisiteEditorDataForPlatformAdmin,
  updateMinisiteForPlatformAdmin,
} from "@/server/modules/minisite/minisite.service";
import { uploadPlatformShopMediaAction } from "@/server/modules/minisite/upload-platform-media";
import type { ShopMediaKind } from "@/lib/validations/minisite-editor";

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

export async function setPlatformOwnerEmailAction(shopId: string, email: string, reason: string) {
  await adminGate();
  return setPlatformOwnerEmail(shopId, email, reason);
}

export async function setPlatformOwnerPasswordAction(
  shopId: string,
  password: string,
  reason: string,
  emailForProvision?: string,
) {
  await adminGate();
  return setPlatformOwnerPassword(shopId, password, reason, emailForProvision);
}

export async function setPlatformShopTemplateAction(shopId: string, template: string) {
  await adminGate();
  return setPlatformShopTemplate(shopId, template);
}

export async function setPlatformShopMinisiteTemplatesAction(
  shopId: string,
  allowedTemplates: string[],
  activeTemplate: string,
) {
  await adminGate();
  return setPlatformShopMinisiteTemplates(shopId, allowedTemplates, activeTemplate);
}

export async function setPlatformShopBookingAutoAssignAction(shopId: string, enabled: boolean) {
  await adminGate();
  return setPlatformShopBookingAutoAssign(shopId, enabled);
}

export async function loadPlatformMinisiteEditorAction(shopId: string) {
  await adminGate();
  const data = await loadMinisiteEditorDataForPlatformAdmin(shopId);
  if (!data) {
    return { ok: false as const, code: "NOT_FOUND" };
  }
  return { ok: true as const, data };
}

export async function savePlatformMinisiteAction(shopId: string, input: unknown) {
  await adminGate();
  return updateMinisiteForPlatformAdmin(shopId, input);
}

export async function setPlatformMinisiteManagedAction(shopId: string, managed: boolean) {
  await adminGate();
  return setPlatformMinisiteManaged(shopId, managed);
}

export async function setPlatformShopDashboardNavAction(shopId: string, navKeys: string[] | null) {
  await adminGate();
  return setPlatformShopDashboardNav(shopId, navKeys);
}

export async function uploadPlatformMinisiteMediaAction(
  shopId: string,
  kind: ShopMediaKind,
  formData: FormData,
) {
  await adminGate();
  return uploadPlatformShopMediaAction(shopId, kind, formData);
}
