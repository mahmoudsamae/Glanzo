import "server-only";

import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auditDiff, writeAuditLog } from "@/server/modules/audit/write-audit-log";
import { requireShopOwner } from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

const remindersToggleSchema = z.object({
  remindersEnabled: z.boolean(),
});

export type NotificationSettingsData = {
  remindersEnabled: boolean;
};

export async function loadNotificationSettings(
  actor: Actor,
  shopId: string,
): Promise<NotificationSettingsData> {
  requireShopOwner(actor, shopId);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("shops")
    .select("reminders_enabled")
    .eq("id", shopId)
    .single();

  if (error) {
    throw error;
  }

  return { remindersEnabled: data.reminders_enabled };
}

export async function updateRemindersEnabled(
  actor: Actor,
  shopId: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; code: "VALIDATION" | "FORBIDDEN" | "UNKNOWN" }> {
  try {
    requireShopOwner(actor, shopId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = remindersToggleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: before, error: loadError } = await supabase
    .from("shops")
    .select("reminders_enabled")
    .eq("id", shopId)
    .single();

  if (loadError) {
    return { ok: false, code: "UNKNOWN" };
  }

  const { error } = await supabase
    .from("shops")
    .update({ reminders_enabled: parsed.data.remindersEnabled })
    .eq("id", shopId);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "shop.reminders_toggled",
    entity: "shop",
    entity_id: shopId,
    diff: auditDiff(
      { reminders_enabled: before.reminders_enabled },
      { reminders_enabled: parsed.data.remindersEnabled },
    ),
  });

  return { ok: true };
}
