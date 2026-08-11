/** Returns true when a Next.js server action intentionally throws to redirect. */
export function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      return true;
    }
  }

  // Serialized / wrapped forms seen across the server-action boundary
  const message =
    "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  return message.includes("NEXT_REDIRECT") || message.includes("NEXT_HTTP_ERROR_FALLBACK;3");
}
