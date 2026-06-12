-- Step 7: shop status changes are service-role only (not even platform admin via direct UPDATE).
-- Platform admins use privileged server paths in later phases — not raw PostgREST UPDATE.

CREATE OR REPLACE FUNCTION public.protect_shop_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'only service role may change shop status';
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.protect_shop_status_change() IS
  'Status transitions require service_role. Direct authenticated/platform-admin UPDATE is blocked.';
