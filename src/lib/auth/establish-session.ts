import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { authFlowLog } from "@/lib/auth/flow-log";
import type { Database } from "@/types/database.types";

type SignUpResult = {
  user: User | null;
  session: Session | null;
};

/**
 * After signUp, Supabase may return a user without a session (confirm-email on,
 * SMTP misconfig, or SSR cookie timing). When confirmations are off, sign-in
 * immediately should succeed — this bridges that gap.
 */
export async function establishSessionAfterSignUp(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string,
  signUp: SignUpResult,
): Promise<{ session: Session | null; user: User | null; usedSignInFallback: boolean }> {
  if (signUp.session) {
    authFlowLog("signup", { hasSession: true, usedSignInFallback: false });
    return { session: signUp.session, user: signUp.user, usedSignInFallback: false };
  }

  authFlowLog("signup", {
    hasSession: false,
    hasUser: Boolean(signUp.user),
    usedSignInFallback: true,
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authFlowLog("signup-signin-fallback", {
      ok: false,
      code: error.code ?? "unknown",
      message: error.message,
    });
    return { session: null, user: signUp.user, usedSignInFallback: true };
  }

  authFlowLog("signup-signin-fallback", { ok: true, hasSession: Boolean(data.session) });
  return {
    session: data.session,
    user: data.user ?? signUp.user,
    usedSignInFallback: true,
  };
}
