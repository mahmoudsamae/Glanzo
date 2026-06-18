export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED"
  | "OAUTH_FAILED"
  | "RESET_FAILED"
  | "UPDATE_PASSWORD_FAILED"
  | "NOT_PLATFORM_ADMIN"
  | "UNKNOWN";

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "That email or password isn't right.",
  EMAIL_NOT_CONFIRMED: "Confirm your email first — check your inbox.",
  EMAIL_TAKEN: "That email is already registered. Try signing in instead.",
  WEAK_PASSWORD: "Choose a password with at least 8 characters.",
  RATE_LIMITED: "Too many tries. Give it a minute.",
  OAUTH_FAILED: "Google sign-in didn't work. Try email instead.",
  RESET_FAILED: "We couldn't send that reset link. Check the email and try again.",
  UPDATE_PASSWORD_FAILED: "That link may have expired. Request a new reset.",
  NOT_PLATFORM_ADMIN:
    "Dieses Konto hat keinen Plattform-Zugang. Bitte in Supabase platform_admins eintragen.",
  UNKNOWN: "Something went wrong. Try again.",
};

export function authErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code];
}

type SupabaseAuthErrorLike = {
  message?: string;
  code?: string;
};

export function mapSupabaseAuthError(error: string | SupabaseAuthErrorLike): AuthErrorCode {
  const message = typeof error === "string" ? error : (error.message ?? "");
  const authCode = typeof error === "string" ? "" : (error.code ?? "");
  const lower = message.toLowerCase();
  const code = authCode.toLowerCase();

  if (code === "email_not_confirmed" || lower.includes("email not confirmed")) {
    return "EMAIL_NOT_CONFIRMED";
  }
  if (lower.includes("invalid login credentials") || code === "invalid_credentials") {
    return "INVALID_CREDENTIALS";
  }
  if (lower.includes("invalid api key")) {
    return "UNKNOWN";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "EMAIL_TAKEN";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "WEAK_PASSWORD";
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("for security purposes") ||
    lower.includes("only request this after")
  ) {
    return "RATE_LIMITED";
  }

  return "UNKNOWN";
}
