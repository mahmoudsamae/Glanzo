import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

import type { EmailAdapter } from "./types";

export function createResendEmailAdapter(): EmailAdapter {
  const apiKey = serverEnv.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required for the Resend adapter");
  }

  const resend = new Resend(apiKey);
  const from = serverEnv.EMAIL_FROM;

  return async ({ to, subject, html, text, idempotencyKey }) => {
    const { data, error } = await resend.emails.send(
      { from, to, subject, html, text },
      { idempotencyKey },
    );

    if (error) {
      return { ok: false, code: error.name ?? "RESEND_ERROR", message: error.message };
    }

    return { ok: true, id: data?.id ?? idempotencyKey };
  };
}
