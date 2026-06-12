-- Migration 9: Phase 5 — minisite table, shop-media storage, public RPC (anon door only)

-- ---------------------------------------------------------------------------
-- Enum + minisite (1:1 with shops)
-- ---------------------------------------------------------------------------

CREATE TYPE public.minisite_template AS ENUM ('classic', 'midnight', 'bold');

CREATE TABLE public.minisite (
  shop_id uuid PRIMARY KEY REFERENCES public.shops (id) ON DELETE CASCADE,
  template public.minisite_template NOT NULL DEFAULT 'midnight',
  accent_hex text NOT NULL DEFAULT '#b08d4a',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT minisite_accent_hex_format CHECK (accent_hex ~ '^#[0-9a-fA-F]{6}$')
);

COMMENT ON TABLE public.minisite IS
  'Owner-customized public mini-site content. Anon reads via get_shop_public_data RPC only.';

CREATE TRIGGER minisite_set_updated_at
  BEFORE UPDATE ON public.minisite
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Default row per existing shop
INSERT INTO public.minisite (shop_id)
SELECT s.id
FROM public.shops s
ON CONFLICT (shop_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.create_minisite_for_new_shop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.minisite (shop_id)
  VALUES (NEW.id)
  ON CONFLICT (shop_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER shops_after_insert_minisite
  AFTER INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.create_minisite_for_new_shop();

-- ---------------------------------------------------------------------------
-- RLS: owner write, members read, anon nothing
-- ---------------------------------------------------------------------------

ALTER TABLE public.minisite ENABLE ROW LEVEL SECURITY;

CREATE POLICY minisite_select_member_or_admin
  ON public.minisite
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY minisite_insert_owner
  ON public.minisite
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY minisite_update_owner
  ON public.minisite
  FOR UPDATE
  TO authenticated
  USING (public.is_shop_owner(shop_id))
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY minisite_delete_owner
  ON public.minisite
  FOR DELETE
  TO authenticated
  USING (public.is_shop_owner(shop_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.minisite TO authenticated;

-- ---------------------------------------------------------------------------
-- Close anon direct table reads — public surface uses RPC only (Phase 5)
-- ---------------------------------------------------------------------------

REVOKE SELECT ON public.shops FROM anon;
DROP POLICY IF EXISTS shops_select_anon_minisite ON public.shops;

-- ---------------------------------------------------------------------------
-- Storage: shop-media bucket (public read, owner write own prefix)
-- Path: {shop_id}/{logo|cover|gallery}/...
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-media',
  'shop-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery');
$$;

COMMENT ON FUNCTION public.shop_media_path_owned(text) IS
  'True when storage object path is {shop_id}/{logo|cover|gallery}/... and caller owns the shop.';

GRANT EXECUTE ON FUNCTION public.shop_media_path_owned(text) TO authenticated, service_role;

CREATE POLICY shop_media_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shop-media');

CREATE POLICY shop_media_owner_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_owned(name)
  );

CREATE POLICY shop_media_owner_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_owned(name)
  )
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_owned(name)
  );

CREATE POLICY shop_media_owner_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_owned(name)
  );

-- ---------------------------------------------------------------------------
-- get_shop_public_data — anon-callable whitelisted JSON only
-- ---------------------------------------------------------------------------

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
        'price_cents', s.price_cents
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
      'opening_hours', v_shop.opening_hours
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

COMMENT ON FUNCTION public.get_shop_public_data(text) IS
  'Single anon door for the public mini-site. Returns whitelisted shop, services, team, minisite JSON only.';

REVOKE ALL ON FUNCTION public.get_shop_public_data(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shop_public_data(text) TO anon, authenticated, service_role;
