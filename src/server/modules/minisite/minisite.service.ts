import "server-only";

import { MINISITE_TEMPLATES } from "@/lib/minisite/template-registry";
import { normalizeAllowedMinisiteTemplates, isMinisiteTemplateAllowed } from "@/lib/minisite/allowed-templates";
import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  minisiteSaveInputSchema,
  validateMinisiteMediaPaths,
} from "@/lib/validations/minisite-editor";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";
import type { MinisiteContent } from "@/lib/validations/public-shop";
import type { MinisiteTemplate } from "@/lib/validations/public-shop";
import { auditDiff, writeAuditLog } from "@/server/modules/audit/write-audit-log";
import { requireShopOwner } from "@/server/modules/auth/assert-shop-access";
import { getActor } from "@/server/modules/auth/get-actor";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Actor } from "@/server/modules/auth/types";

import { getPublicShopDataBySlug } from "./get-public-shop";

export type { MinisiteEditorData } from "@/lib/minisite/editor-types";

export type MinisiteUpdateResult =
  | { ok: true }
  | { ok: false; code: "FORBIDDEN" | "VALIDATION" | "NOT_FOUND" | "UNKNOWN" | "MANAGED" };

async function loadShopMinisiteRow(shopId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, slug, allowed_minisite_templates, minisite_managed")
    .eq("id", shopId)
    .maybeSingle();

  if (shopError || !shop) {
    return null;
  }

  const { data: minisite, error: minisiteError } = await supabase
    .from("minisite")
    .select("template, accent_hex, content")
    .eq("shop_id", shopId)
    .maybeSingle();

  if (minisiteError || !minisite) {
    return null;
  }

  const publicData = await getPublicShopDataBySlug(shop.slug);
  if (!publicData) {
    return null;
  }

  return { shop, minisite, publicData };
}

function buildEditorData(
  shop: {
    id: string;
    slug: string;
    allowed_minisite_templates: MinisiteTemplate[] | null;
    minisite_managed: boolean;
  },
  minisite: { template: MinisiteTemplate; accent_hex: string; content: unknown },
  publicData: NonNullable<Awaited<ReturnType<typeof getPublicShopDataBySlug>>>,
  editorMode: "owner" | "admin",
): MinisiteEditorData {
  const allowedTemplates =
    editorMode === "admin"
      ? (Object.keys(MINISITE_TEMPLATES) as MinisiteTemplate[])
      : normalizeAllowedMinisiteTemplates(shop.allowed_minisite_templates, minisite.template);

  return {
    shopId: shop.id,
    shopSlug: shop.slug,
    template: minisite.template,
    allowedTemplates,
    accentHex: minisite.accent_hex,
    content: (minisite.content ?? {}) as MinisiteContent,
    publicData,
    minisiteManaged: shop.minisite_managed,
    editorMode,
  };
}

export async function loadMinisiteEditorData(
  actor: Actor,
  shopId: string,
): Promise<MinisiteEditorData | null> {
  requireShopOwner(actor, shopId);
  const row = await loadShopMinisiteRow(shopId);
  if (!row) {
    return null;
  }

  return buildEditorData(row.shop, row.minisite, row.publicData, "owner");
}

export async function loadMinisiteEditorDataForPlatformAdmin(
  shopId: string,
): Promise<MinisiteEditorData | null> {
  await requirePlatformAdmin();
  const row = await loadShopMinisiteRow(shopId);
  if (!row) {
    return null;
  }

  return buildEditorData(row.shop, row.minisite, row.publicData, "admin");
}

export async function isShopMinisiteManaged(shopId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("shops").select("minisite_managed").eq("id", shopId).maybeSingle();
  return Boolean(data?.minisite_managed);
}

export async function updateMinisite(
  actor: Actor,
  shopId: string,
  input: unknown,
): Promise<MinisiteUpdateResult> {
  try {
    requireShopOwner(actor, shopId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  if (await isShopMinisiteManaged(shopId)) {
    return { ok: false, code: "MANAGED" };
  }

  const parsed = minisiteSaveInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  if (!validateMinisiteMediaPaths(shopId, parsed.data.content)) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();

  const { data: shop, error: shopLoadError } = await supabase
    .from("shops")
    .select("allowed_minisite_templates")
    .eq("id", shopId)
    .maybeSingle();

  if (shopLoadError || !shop) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const allowedTemplates = normalizeAllowedMinisiteTemplates(
    shop.allowed_minisite_templates as MinisiteTemplate[] | null,
    parsed.data.template,
  );

  if (!isMinisiteTemplateAllowed(parsed.data.template, allowedTemplates)) {
    return { ok: false, code: "VALIDATION" };
  }

  const { data: existing, error: loadError } = await supabase
    .from("minisite")
    .select("template, accent_hex, content")
    .eq("shop_id", shopId)
    .maybeSingle();

  if (loadError) {
    return { ok: false, code: "UNKNOWN" };
  }
  if (!existing) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const { error } = await supabase
    .from("minisite")
    .update({
      template: parsed.data.template,
      accent_hex: parsed.data.accentHex,
      content: parsed.data.content,
    })
    .eq("shop_id", shopId);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "minisite.updated",
    entity: "minisite",
    entity_id: shopId,
    diff: auditDiff(
      {
        template: existing.template,
        accent_hex: existing.accent_hex,
        content: existing.content,
      },
      {
        template: parsed.data.template,
        accent_hex: parsed.data.accentHex,
        content: parsed.data.content,
      },
    ),
  });

  revalidateShopPublic(shopId);
  return { ok: true };
}

export async function updateMinisiteForPlatformAdmin(
  shopId: string,
  input: unknown,
): Promise<MinisiteUpdateResult> {
  await requirePlatformAdmin();

  const parsed = minisiteSaveInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  if (!validateMinisiteMediaPaths(shopId, parsed.data.content)) {
    return { ok: false, code: "VALIDATION" };
  }

  const admin = createServiceRoleClient();
  const { data: existing, error: loadError } = await admin
    .from("minisite")
    .select("template, accent_hex, content")
    .eq("shop_id", shopId)
    .maybeSingle();

  if (loadError) {
    return { ok: false, code: "UNKNOWN" };
  }
  if (!existing) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const { error } = await admin
    .from("minisite")
    .update({
      template: parsed.data.template,
      accent_hex: parsed.data.accentHex,
      content: parsed.data.content,
    })
    .eq("shop_id", shopId);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  const actor = await getActor();
  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor?.userId ?? null,
    actor_type: "platform",
    action: "minisite.updated",
    entity: "minisite",
    entity_id: shopId,
    diff: auditDiff(
      {
        template: existing.template,
        accent_hex: existing.accent_hex,
        content: existing.content,
      },
      {
        template: parsed.data.template,
        accent_hex: parsed.data.accentHex,
        content: parsed.data.content,
      },
    ),
  });

  revalidateShopPublic(shopId);
  return { ok: true };
}
