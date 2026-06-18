import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  platformOwnerEmailChangeSchema,
  platformOwnerPasswordSetSchema,
} from "@/lib/validations/platform-admin";
import { writeAuditLog } from "@/server/modules/audit/write-audit-log";
import { getActor } from "@/server/modules/auth/get-actor";
import { requirePlatformAdmin } from "@/server/modules/shops/create-shop.service";

import type { PlatformResult } from "./platform.service";

type OwnerContext = {
  ownerUserId: string;
  ownerEmail: string | null;
};

async function loadOwnerContext(shopId: string): Promise<OwnerContext | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("platform_get_shop", { p_shop_id: shopId });
  if (error) {
    throw error;
  }

  const record = data as { owner_user_id?: string | null; owner_email?: string | null };
  if (!record.owner_user_id) {
    return null;
  }

  return {
    ownerUserId: record.owner_user_id,
    ownerEmail: record.owner_email ?? null,
  };
}

export async function setPlatformOwnerEmail(
  shopId: string,
  newEmail: string,
  reason: string,
): Promise<PlatformResult<{ email: string }>> {
  await requirePlatformAdmin();
  const actor = await getActor();
  if (!actor?.isPlatformAdmin) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = platformOwnerEmailChangeSchema.safeParse({ email: newEmail, reason });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const owner = await loadOwnerContext(shopId);
  if (!owner) {
    return { ok: false, code: "NO_OWNER" };
  }

  if (owner.ownerEmail?.toLowerCase() === parsed.data.email.toLowerCase()) {
    return { ok: false, code: "UNCHANGED" };
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(owner.ownerUserId, {
    email: parsed.data.email,
    email_confirm: true,
  });

  if (error) {
    if (/already registered|duplicate|exists/i.test(error.message)) {
      return { ok: false, code: "EMAIL_TAKEN" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "platform",
    action: "owner.email_changed",
    entity: "profile",
    entity_id: owner.ownerUserId,
    diff: {
      reason: parsed.data.reason,
      before: { email: owner.ownerEmail },
      after: { email: parsed.data.email },
    },
  });

  return { ok: true, data: { email: parsed.data.email } };
}

export async function setPlatformOwnerPassword(
  shopId: string,
  password: string,
  reason: string,
): Promise<PlatformResult<{ updated: true }>> {
  await requirePlatformAdmin();
  const actor = await getActor();
  if (!actor?.isPlatformAdmin) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = platformOwnerPasswordSetSchema.safeParse({ password, reason });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const owner = await loadOwnerContext(shopId);
  if (!owner) {
    return { ok: false, code: "NO_OWNER" };
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(owner.ownerUserId, {
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "platform",
    action: "owner.password_set_by_platform",
    entity: "profile",
    entity_id: owner.ownerUserId,
    diff: { reason: parsed.data.reason },
  });

  return { ok: true, data: { updated: true } };
}
