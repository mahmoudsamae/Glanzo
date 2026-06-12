-- Step 5: atomic shop creation + slug availability check
-- Writes to shops, memberships, and audit_logs flow through SECURITY DEFINER functions (not service role).

CREATE OR REPLACE FUNCTION public.is_shop_slug_reserved(p_slug text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT p_slug = ANY (
    ARRAY['www', 'app', 'api', 'admin', 'mail', 'staging', 'demo']::text[]
  );
$$;

COMMENT ON FUNCTION public.is_shop_slug_reserved(text) IS
  'Mirrors RESERVED_SUBDOMAINS in src/lib/tenant.ts — keep in sync.';

CREATE OR REPLACE FUNCTION public.is_shop_slug_available(p_slug text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9](-?[a-z0-9])*$'
    OR char_length(p_slug) < 3
    OR char_length(p_slug) > 40
  THEN
    RETURN false;
  END IF;

  IF public.is_shop_slug_reserved(p_slug) THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.shops s
    WHERE s.slug = p_slug
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_shop_slug_available(text) TO authenticated;
REVOKE ALL ON FUNCTION public.is_shop_slug_available(text) FROM anon, public;

CREATE OR REPLACE FUNCTION public.create_shop_with_owner(
  p_name text,
  p_slug text,
  p_timezone text,
  p_opening_hours jsonb
)
RETURNS public.shops
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_shop public.shops;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED'
      USING ERRCODE = '42501';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'INVALID_NAME'
      USING ERRCODE = '22023';
  END IF;

  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9](-?[a-z0-9])*$'
    OR char_length(p_slug) < 3
    OR char_length(p_slug) > 40
  THEN
    RAISE EXCEPTION 'SLUG_INVALID'
      USING ERRCODE = '22023';
  END IF;

  IF public.is_shop_slug_reserved(p_slug) THEN
    RAISE EXCEPTION 'SLUG_RESERVED'
      USING ERRCODE = '22023';
  END IF;

  IF NOT public.is_valid_iana_timezone(p_timezone) THEN
    RAISE EXCEPTION 'TIMEZONE_INVALID'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.memberships m
    INNER JOIN public.shops s ON s.id = m.shop_id
    WHERE m.user_id = v_user_id
      AND m.role = 'owner'::public.membership_role
      AND m.archived_at IS NULL
      AND s.slug = p_slug
  ) THEN
    RAISE EXCEPTION 'SLUG_OWNED'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.shops (name, slug, timezone, opening_hours, currency)
  VALUES (btrim(p_name), p_slug, p_timezone, p_opening_hours, 'EUR')
  RETURNING * INTO v_shop;

  INSERT INTO public.memberships (shop_id, user_id, role)
  VALUES (v_shop.id, v_user_id, 'owner'::public.membership_role);

  INSERT INTO public.audit_logs (
    shop_id,
    actor_id,
    actor_type,
    action,
    entity,
    entity_id,
    diff
  )
  VALUES (
    v_shop.id,
    v_user_id,
    'user'::public.actor_type,
    'shop.created',
    'shop',
    v_shop.id,
    jsonb_build_object('name', btrim(p_name), 'slug', p_slug)
  );

  RETURN v_shop;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'SLUG_TAKEN'
      USING ERRCODE = '23505';
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_shop_with_owner(text, text, text, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.create_shop_with_owner(text, text, text, jsonb) FROM anon, public;

COMMENT ON FUNCTION public.create_shop_with_owner(text, text, text, jsonb) IS
  'Atomic onboarding: shop + owner membership + audit row in one transaction. Called as authenticated (not service role).';

COMMENT ON POLICY memberships_select_member_or_admin ON public.memberships IS
  'SELECT only for members/admins. INSERT/UPDATE/DELETE via create_shop_with_owner (Step 5) or future invite flows (Phase 2).';

COMMENT ON POLICY audit_logs_select_owner_or_admin ON public.audit_logs IS
  'Append-only reads for owners/admins. Inserts via create_shop_with_owner (Step 5) or privileged server paths.';
