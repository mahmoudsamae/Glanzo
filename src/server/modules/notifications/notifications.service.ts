import "server-only";

import {
  computeFailureTransition,
  sentTransition,
  skippedTransition,
  type OutboxTransition,
} from "@/lib/notifications/outbox-transitions";
import { resolveRecipientEmail } from "@/lib/notifications/recipient";
import type { OutboxPayload, OutboxRow } from "@/lib/notifications/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getEmailAdapter, type EmailAdapter } from "@/server/integrations/resend";

import {
  loadAppointmentStatus,
  loadNotificationRenderContext,
  loadShopRemindersEnabled,
} from "./load-template-context";
import { renderNotificationTemplate } from "./templates";

export const BATCH_LIMIT = 25;
export const RUNTIME_BUDGET_MS = 10_000;

export type DispatchCounts = {
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
  dead: number;
  durationMs: number;
};

export type RowProcessResult = "sent" | "skipped" | "failed" | "dead";

async function evaluateSkip(
  row: OutboxRow,
): Promise<{ skip: boolean; reason?: string }> {
  if (row.template === "reminder_24h") {
    const remindersEnabled = await loadShopRemindersEnabled(row.shop_id);
    if (!remindersEnabled) {
      return { skip: true, reason: "reminders_disabled" };
    }

    const status = await loadAppointmentStatus(row.shop_id, row.appointment_id);
    if (status && status !== "booked") {
      return { skip: true, reason: `appointment_${status}` };
    }
  }

  return { skip: false };
}

async function applyTransition(
  row: OutboxRow,
  transition: OutboxTransition,
  payload: OutboxPayload,
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("notification_outbox")
    .update({
      status: transition.status,
      scheduled_for: transition.scheduledFor?.toISOString() ?? row.scheduled_for,
      last_error: transition.lastError ?? null,
      claimed_at: null,
      payload: payload as never,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    throw error;
  }
}

export async function processOutboxRow(
  row: OutboxRow,
  emailAdapter: EmailAdapter = getEmailAdapter(),
): Promise<RowProcessResult> {
  const payload = (row.payload ?? {}) as OutboxPayload;
  const recipient = resolveRecipientEmail(payload);

  if (!recipient) {
    const transition = skippedTransition("missing_recipient");
    await applyTransition(row, transition, payload);
    return "skipped";
  }

  const skip = await evaluateSkip(row);
  if (skip.skip) {
    const transition = skippedTransition(skip.reason ?? "skipped");
    await applyTransition(row, transition, payload);
    return "skipped";
  }

  const context = await loadNotificationRenderContext(row.shop_id, row.appointment_id);
  if (!context) {
    const transition = computeFailureTransition(row.attempts, "context_not_found");
    await applyTransition(row, transition, payload);
    return transition.status === "dead" ? "dead" : "failed";
  }

  let rendered;
  try {
    rendered = renderNotificationTemplate(row.template, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : "render_error";
    const transition = computeFailureTransition(row.attempts, message);
    await applyTransition(row, transition, payload);
    return transition.status === "dead" ? "dead" : "failed";
  }

  const sendResult = await emailAdapter({
    to: recipient,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    idempotencyKey: row.id,
  });

  if (!sendResult.ok) {
    const transition = computeFailureTransition(row.attempts, sendResult.message);
    await applyTransition(row, transition, payload);
    return transition.status === "dead" ? "dead" : "failed";
  }

  const nextPayload: OutboxPayload = {
    ...payload,
    provider_message_id: sendResult.id,
  };
  await applyTransition(row, sentTransition(), nextPayload);
  return "sent";
}

export async function dispatchNotificationBatch(
  emailAdapter: EmailAdapter = getEmailAdapter(),
): Promise<DispatchCounts> {
  const started = Date.now();
  const deadline = started + RUNTIME_BUDGET_MS;
  const supabase = createServiceRoleClient();

  const { data: claimed, error } = await supabase.rpc("claim_outbox_batch", {
    p_limit: BATCH_LIMIT,
  });

  if (error) {
    throw error;
  }

  const rows = (claimed ?? []) as OutboxRow[];
  const counts: DispatchCounts = {
    claimed: rows.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    dead: 0,
    durationMs: 0,
  };

  for (const row of rows) {
    if (Date.now() > deadline) {
      break;
    }

    const result = await processOutboxRow(row, emailAdapter);
    counts[result] += 1;
  }

  counts.durationMs = Date.now() - started;
  return counts;
}
