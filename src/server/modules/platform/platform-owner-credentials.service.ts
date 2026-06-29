import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  platformOwnerEmailChangeSchema,
  platformOwnerPasswordSetSchema,
  platformOwnerProvisionSchema,
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

async function resolveAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.rpc("platform_lookup_user_id_by_email", {
    p_email: email,
  });
  if (error) {
    return null;
  }
  return typeof data === "string" ? data : null;
}

export async function provisionPlatformOwnerAccount(
  shopId: string,
  email: string,
  password: string,
  reason: string,
): Promise<PlatformResult<{ email: string; userId: string }>> {
  await requirePlatformAdmin();
  const actor = await getActor();
  if (!actor?.isPlatformAdmin) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = platformOwnerProvisionSchema.safeParse({ email, password, reason });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const admin = createServiceRoleClient();
  let userId: string | null = null;

  const created = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (created.error) {
    if (/already|registered|exists|duplicate/i.test(created.error.message)) {
      userId = await resolveAuthUserIdByEmail(normalizedEmail);
      if (!userId) {
        return { ok: false, code: "EMAIL_TAKEN" };
      }
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password: parsed.data.password,
        email_confirm: true,
      });
      if (updateError) {
        return { ok: false, code: "UNKNOWN" };
      }
    } else {
      return { ok: false, code: "UNKNOWN" };
    }
  } else {
    userId = created.data.user?.id ?? null;
  }

  if (!userId) {
    return { ok: false, code: "UNKNOWN" };
  }

  const supabase = await createServerSupabaseClient();
  const { error: attachError } = await supabase.rpc("platform_attach_owner_membership", {
    p_shop_id: shopId,
    p_user_id: userId,
    p_email: normalizedEmail,
  });

  if (attachError) {
    if (/OWNER_EXISTS/i.test(attachError.message)) {
      return { ok: false, code: "OWNER_EXISTS" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "platform",
    action: "owner.credentials_provisioned",
    entity: "profile",
    entity_id: userId,
    diff: { reason: parsed.data.reason, email: normalizedEmail },
  });

  return { ok: true, data: { email: normalizedEmail, userId } };
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
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("platform_set_pending_owner_email", {
      p_shop_id: shopId,
      p_email: parsed.data.email,
    });
    if (error) {
      if (/INVALID_EMAIL/i.test(error.message)) {
        return { ok: false, code: "VALIDATION" };
      }
      return { ok: false, code: "UNKNOWN" };
    }
    const payload = data as { owner_email?: string };
    return { ok: true, data: { email: payload.owner_email ?? parsed.data.email } };
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
  emailForProvision?: string,
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
    const email = emailForProvision?.trim();
    if (!email) {
      return { ok: false, code: "NO_OWNER_EMAIL" };
    }
    const provisioned = await provisionPlatformOwnerAccount(
      shopId,
      email,
      parsed.data.password,
      parsed.data.reason,
    );
    if (!provisioned.ok) {
      return { ok: false, code: provisioned.code };
    }
    return { ok: true, data: { updated: true } };
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
