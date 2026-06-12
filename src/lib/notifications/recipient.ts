import type { OutboxPayload } from "./types";

/** Recipient resolution: payload.to holds the email for every template (see migration comments). */
export function resolveRecipientEmail(payload: OutboxPayload): string | null {
  const email = payload.to?.trim();
  return email ? email : null;
}
