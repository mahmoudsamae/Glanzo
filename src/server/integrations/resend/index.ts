import "server-only";

import { serverEnv } from "@/lib/env";

import { createLogEmailAdapter } from "./log-adapter";
import { createResendEmailAdapter } from "./resend-adapter";
import type { EmailAdapter } from "./types";

export type { EmailAdapter, SendEmailInput, SendEmailResult } from "./types";

/** Resend when configured; otherwise local log adapter (no external calls). */
export function getEmailAdapter(): EmailAdapter {
  if (serverEnv.RESEND_API_KEY) {
    return createResendEmailAdapter();
  }
  return createLogEmailAdapter();
}
