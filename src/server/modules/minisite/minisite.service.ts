import "server-only";

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
import type { Actor } from "@/server/modules/auth/types";

import { getPublicShopDataBySlug } from "./get-public-shop";

export type { MinisiteEditorData } from "@/lib/minisite/editor-types";

export type MinisiteUpdateResult =
  | { ok: true }
  | { ok: false; code: "FORBIDDEN" | "VALIDATION" | "NOT_FOUND" | "UNKNOWN" };

export async function loadMinisiteEditorData(
  actor: Actor,
  shopId: string,
): Promise<MinisiteEditorData | null> {
  requireShopOwner(actor, shopId);
  const supabase = await createServerSupabaseClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, slug, allowed_minisite_templates")
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

  return {
    shopId,
    shopSlug: shop.slug,
    template: minisite.template,
    allowedTemplates: normalizeAllowedMinisiteTemplates(
      shop.allowed_minisite_templates as MinisiteTemplate[] | null,
      minisite.template,
    ),
    accentHex: minisite.accent_hex,
    content: (minisite.content ?? {}) as MinisiteContent,
    publicData,
  };
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
