"use server";

import { redirect } from "next/navigation";

import { clientEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authErrorMessage, mapSupabaseAuthError } from "@/lib/auth/errors";
import {
  isDuplicateSignUpUser,
  isSupabaseTransportError,
  supabaseTransportErrorResult,
} from "@/lib/auth/supabase-transport";
import type { AuthActionResult } from "@/lib/auth/types";
import {
  getActorState,
  resolvePostAuthRedirect,
} from "@/server/modules/auth/get-actor-state";

export async function loginWithPassword(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: authErrorMessage("INVALID_CREDENTIALS"),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const code = mapSupabaseAuthError(error);
      return { ok: false, code, message: authErrorMessage(code) };
    }

    const state = await getActorState();
    if (state.kind === "unauthenticated") {
      return {
        ok: false,
        code: "EMAIL_NOT_CONFIRMED",
        message: authErrorMessage("EMAIL_NOT_CONFIRMED"),
      };
    }

    const next = String(formData.get("next") ?? "").trim();
    const redirectTo = safeInternalRedirect(next) ?? resolvePostAuthRedirect(state.actor);
    return { ok: true, redirectTo };
  } catch (error) {
    if (isSupabaseTransportError(error)) {
      return supabaseTransportErrorResult();
    }
    throw error;
  }
}

function safeInternalRedirect(path: string): string | null {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }
  return path;
}

export async function registerWithPassword(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (password.length < 8) {
    return {
      ok: false,
      code: "WEAK_PASSWORD",
      message: authErrorMessage("WEAK_PASSWORD"),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      const code = mapSupabaseAuthError(error);
      return { ok: false, code, message: authErrorMessage(code) };
    }

    if (isDuplicateSignUpUser(data.user)) {
      return {
        ok: false,
        code: "EMAIL_TAKEN",
        message: authErrorMessage("EMAIL_TAKEN"),
      };
    }

    if (data.session) {
      const next = String(formData.get("next") ?? "").trim();
      const redirectTo = safeInternalRedirect(next) ?? "/onboarding";
      return { ok: true, redirectTo };
    }

    return {
      ok: false,
      code: "EMAIL_NOT_CONFIRMED",
      message: authErrorMessage("EMAIL_NOT_CONFIRMED"),
    };
  } catch (error) {
    if (isSupabaseTransportError(error)) {
      return supabaseTransportErrorResult();
    }
    throw error;
  }
}

export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      ok: false,
      code: "RESET_FAILED",
      message: authErrorMessage("RESET_FAILED"),
    };
  }

  const supabase = await createServerSupabaseClient();
  const redirectTo = `http://${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return {
      ok: false,
      code: "RESET_FAILED",
      message: authErrorMessage("RESET_FAILED"),
    };
  }

  return { ok: true };
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return {
      ok: false,
      code: "WEAK_PASSWORD",
      message: authErrorMessage("WEAK_PASSWORD"),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      ok: false,
      code: "UPDATE_PASSWORD_FAILED",
      message: authErrorMessage("UPDATE_PASSWORD_FAILED"),
    };
  }

  const state = await getActorState();
  if (state.kind === "unauthenticated") {
    return { ok: true, redirectTo: "/login" };
  }

  return { ok: true, redirectTo: resolvePostAuthRedirect(state.actor) };
}

export async function signInWithGoogle(): Promise<void> {
  if (!clientEnv.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  const redirectTo = `http://${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
