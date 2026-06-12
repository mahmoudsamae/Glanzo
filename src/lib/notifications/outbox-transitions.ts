import type { Database } from "@/types/database.types";

import { nextRetryAt, shouldMarkDead } from "./backoff";

type OutboxStatus = Database["public"]["Enums"]["outbox_status"];

export type OutboxTransition = {
  status: OutboxStatus;
  scheduledFor?: Date;
  lastError?: string;
};

export function sentTransition(): OutboxTransition {
  return { status: "sent" };
}

export function skippedTransition(reason: string): OutboxTransition {
  return { status: "skipped", lastError: reason };
}

export function computeFailureTransition(
  attempts: number,
  errorMessage: string,
  from: Date = new Date(),
): OutboxTransition {
  if (shouldMarkDead(attempts)) {
    return { status: "dead", lastError: errorMessage };
  }
  return {
    status: "failed",
    scheduledFor: nextRetryAt(attempts, from),
    lastError: errorMessage,
  };
}
