export type AuthActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; code: string; message: string };

export type CreateShopErrorCode =
  | "NOT_AUTHENTICATED"
  | "VALIDATION"
  | "SLUG_INVALID"
  | "SLUG_RESERVED"
  | "SLUG_TAKEN"
  | "SLUG_OWNED"
  | "TIMEZONE_INVALID"
  | "INVALID_NAME"
  | "UNKNOWN";

export type CreateShopResult =
  | { ok: true; shopSlug: string }
  | { ok: false; code: CreateShopErrorCode };

export type CheckSlugResult =
  | { ok: true; available: boolean }
  | { ok: false; code: "NOT_AUTHENTICATED" | "SLUG_INVALID" | "UNKNOWN" };
