-- Service catalog: optional description, image, and hide price on public minisite.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT true;

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_description_length;

ALTER TABLE public.services
  ADD CONSTRAINT services_description_length CHECK (
    description IS NULL OR char_length(btrim(description)) <= 240
  );

COMMENT ON COLUMN public.services.description IS
  'Short public copy for the minisite — shown when set, especially when show_price is false.';
COMMENT ON COLUMN public.services.image_path IS
  'shop-media path: {shop_id}/service/{uuid}.webp';
COMMENT ON COLUMN public.services.show_price IS
  'When false, minisite shows description instead of price (booking still uses price_cents).';

-- Extend shop-media folder allowlist with service/
CREATE OR REPLACE FUNCTION public.shop_media_path_owned(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.is_shop_owner(((storage.foldername(p_name))[1])::uuid)
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service');
$$;

CREATE OR REPLACE FUNCTION public.shop_media_path_writable(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (
      public.is_shop_owner(((storage.foldername(p_name))[1])::uuid)
      OR public.is_platform_admin()
    )
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service');
$$;

CREATE OR REPLACE FUNCTION public.get_shop_public_data(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_minisite public.minisite;
  v_services jsonb;
  v_team jsonb;
BEGIN
  IF p_slug IS NULL OR btrim(p_slug) = '' THEN
    RETURN NULL;
  END IF;

  SELECT *
  INTO v_shop
  FROM public.shops s
  WHERE s.slug = p_slug;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT *
  INTO v_minisite
  FROM public.minisite ms
  WHERE ms.shop_id = v_shop.id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'duration_min', s.duration_min,
        'price_cents', s.price_cents,
        'description', s.description,
        'image_path', s.image_path,
        'show_price', s.show_price
      )
      ORDER BY s.sort_order ASC, s.name ASC
    ),
    '[]'::jsonb
  )
  INTO v_services
  FROM public.services s
  WHERE s.shop_id = v_shop.id
    AND s.archived_at IS NULL;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'membership_id', m.id,
        'display_name', COALESCE(NULLIF(btrim(p.display_name), ''), 'Staff')
      )
      ORDER BY m.created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_team
  FROM public.memberships m
  INNER JOIN public.profiles p ON p.id = m.user_id
  WHERE m.shop_id = v_shop.id
    AND m.archived_at IS NULL;

  RETURN jsonb_build_object(
    'shop', jsonb_build_object(
      'name', v_shop.name,
      'slug', v_shop.slug,
      'status', v_shop.status,
      'timezone', v_shop.timezone,
      'opening_hours', v_shop.opening_hours,
      'booking_auto_assign_barber', v_shop.booking_auto_assign_barber
    ),
    'services', v_services,
    'team', v_team,
    'minisite', jsonb_build_object(
      'template', COALESCE(v_minisite.template, 'midnight'::public.minisite_template),
      'accent_hex', COALESCE(v_minisite.accent_hex, '#b08d4a'),
      'content', COALESCE(v_minisite.content, '{}'::jsonb)
    )
  );
END;
$$;
