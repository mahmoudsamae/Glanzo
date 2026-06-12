import "server-only";

import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  assertNoForbiddenShopDetailKeys,
  platformCreateShopInputSchema,
  platformOverviewSchema,
  platformShopDetailSchema,
  platformShopListSchema,
  platformShopTodaySchema,
  platformStatusReasonSchema,
} from "@/lib/validations/platform-admin";

export type PlatformResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string };

export async function loadPlatformOverview() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_get_overview");
  if (error) {
    throw error;
  }
  return platformOverviewSchema.parse(data);
}

export async function loadPlatformShopList(params: {
  search?: string;
  status?: string | null;
  cursor?: string | null;
}) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_list_shops", {
    p_search: params.search ?? null,
    p_status: params.status ?? null,
    p_cursor: params.cursor ?? null,
  });
  if (error) {
    throw error;
  }
  return platformShopListSchema.parse(data);
}

export async function loadPlatformShop(shopId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_get_shop", { p_shop_id: shopId });
  if (error) {
    throw error;
  }
  const record = data as Record<string, unknown>;
  assertNoForbiddenShopDetailKeys(record);
  return platformShopDetailSchema.parse(record);
}

export async function loadPlatformShopToday(shopId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.rpc("platform_record_support_view", { p_shop_id: shopId });
  const { data, error } = await supabase.rpc("platform_get_shop_today", { p_shop_id: shopId });
  if (error) {
    throw error;
  }
  return platformShopTodaySchema.parse(data);
}

export async function setPlatformShopStatus(
  shopId: string,
  status: "active" | "suspended",
  reason: string,
): Promise<PlatformResult<{ status: string }>> {
  const parsedReason = platformStatusReasonSchema.safeParse(reason);
  if (!parsedReason.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_set_shop_status", {
    p_shop_id: shopId,
    p_status: status,
    p_reason: parsedReason.data,
  });

  if (error) {
    if (/REASON_REQUIRED/i.test(error.message)) {
      return { ok: false, code: "VALIDATION" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  revalidateShopPublic(shopId);
  return { ok: true, data: { status: (data as { status: string }).status } };
}

export async function createPlatformShop(
  input: unknown,
): Promise<PlatformResult<{ shopId: string; slug: string; invitePath: string; inviteToken: string }>> {
  const parsed = platformCreateShopInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_create_shop", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_owner_email: parsed.data.ownerEmail,
    p_timezone: parsed.data.timezone,
  });

  if (error) {
    if (/SLUG_INVALID|INVALID_EMAIL|INVALID_NAME|TIMEZONE_INVALID/i.test(error.message)) {
      return { ok: false, code: "VALIDATION" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  const payload = data as {
    shop_id: string;
    slug: string;
    invite_path: string;
    invite_token: string;
  };

  revalidateShopPublic(payload.shop_id);
  return {
    ok: true,
    data: {
      shopId: payload.shop_id,
      slug: payload.slug,
      invitePath: payload.invite_path,
      inviteToken: payload.invite_token,
    },
  };
}

export async function createPlatformOwnerInvite(
  shopId: string,
  ownerEmail: string,
): Promise<PlatformResult<{ invitePath: string; inviteToken: string }>> {
  if (!ownerEmail.trim() || !ownerEmail.includes("@")) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_create_owner_invite", {
    p_shop_id: shopId,
    p_owner_email: ownerEmail.trim(),
  });

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  const payload = data as { invite_path: string; invite_token: string };
  return {
    ok: true,
    data: { invitePath: payload.invite_path, inviteToken: payload.invite_token },
  };
}
