export {
  LOCAL_SUPABASE_ANON_KEY,
  LOCAL_SUPABASE_URL,
  SEED,
} from "../rls/constants";

/**
 * Phase 5: anon has no direct table reads on shops.
 * Public mini-site data flows only through get_shop_public_data RPC.
 */
export const ANON_SHOP_FORBIDDEN_COLUMNS = [
  "id",
  "slug",
  "name",
  "status",
  "timezone",
  "opening_hours",
  "currency",
  "booking_lead_time_min",
  "created_at",
] as const;
