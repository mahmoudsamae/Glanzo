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
  | "SESSION_NOT_ESTABLISHED"
  | "PROFILE_SETUP_FAILED"
  | "UNKNOWN";

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "E-Mail oder Passwort ist falsch.",
  EMAIL_NOT_CONFIRMED:
    "Bitte bestätige zuerst deine E-Mail — prüfe dein Postfach oder deaktiviere die Bestätigung in Supabase.",
  EMAIL_TAKEN: "Diese E-Mail ist bereits registriert. Melde dich stattdessen an.",
  WEAK_PASSWORD: "Wähle ein Passwort mit mindestens 8 Zeichen.",
  RATE_LIMITED: "Zu viele Versuche. Bitte kurz warten.",
  OAUTH_FAILED: "Google-Anmeldung hat nicht funktioniert. Versuche es per E-Mail.",
  RESET_FAILED: "Reset-Link konnte nicht gesendet werden. E-Mail prüfen und erneut versuchen.",
  UPDATE_PASSWORD_FAILED: "Der Link ist möglicherweise abgelaufen. Fordere einen neuen Reset an.",
  NOT_PLATFORM_ADMIN:
    "Dieses Konto hat keinen Plattform-Zugang. Bitte in Supabase platform_admins eintragen.",
  SESSION_NOT_ESTABLISHED:
    "Anmeldung nicht abgeschlossen. Seite neu laden oder nach der Registrierung den Salon einrichten.",
  PROFILE_SETUP_FAILED:
    "Dein Konto existiert, aber das Profil konnte nicht angelegt werden. Erneut versuchen oder Support kontaktieren.",
  UNKNOWN: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
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
