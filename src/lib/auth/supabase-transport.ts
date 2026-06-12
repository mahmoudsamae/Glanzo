import type { AuthActionResult } from "@/lib/auth/types";

import { authErrorMessage } from "./errors";

/** Node fetch to Supabase failed before GoTrue returned a response (common on Windows without system CAs). */
export function isSupabaseTransportError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = error.cause as { code?: string } | undefined;

  return (
    error.message === "fetch failed" ||
    cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    cause?.code === "ENOTFOUND" ||
    cause?.code === "ECONNREFUSED" ||
    cause?.code === "ETIMEDOUT"
  );
}

export function supabaseTransportErrorResult(): AuthActionResult {
  return {
    ok: false,
    code: "UNKNOWN",
    message:
      "Could not reach Supabase. Restart with `pnpm dev` (Windows needs system SSL certificates).",
  };
}

/** Supabase hides duplicate sign-ups; an empty identities array means the email is already registered. */
export function isDuplicateSignUpUser(user: { identities?: unknown[] | null } | null): boolean {
  return Boolean(user && (user.identities?.length ?? 0) === 0);
}
