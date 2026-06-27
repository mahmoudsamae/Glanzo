-- Platform-managed minisites: admin configures content/images; owner gets a ready site.

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS minisite_managed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.shops.minisite_managed IS
  'When true, shop owners cannot edit minisite content — Glanzo platform admin manages the public site.';

-- Allow platform admins to upload shop-media for any shop prefix.
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
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery');
$$;

COMMENT ON FUNCTION public.shop_media_path_writable(text) IS
  'True when path is {shop_id}/{logo|cover|gallery}/... and caller is shop owner or platform admin.';

GRANT EXECUTE ON FUNCTION public.shop_media_path_writable(text) TO authenticated, service_role;

DROP POLICY IF EXISTS shop_media_owner_insert ON storage.objects;
CREATE POLICY shop_media_owner_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );

DROP POLICY IF EXISTS shop_media_owner_update ON storage.objects;
CREATE POLICY shop_media_owner_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  )
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );

DROP POLICY IF EXISTS shop_media_owner_delete ON storage.objects;
CREATE POLICY shop_media_owner_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );

CREATE OR REPLACE FUNCTION public.platform_update_minisite(
  p_shop_id uuid,
  p_template public.minisite_template,
  p_accent_hex text,
  p_content jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_before public.minisite;
BEGIN
  PERFORM public.require_platform_admin();

  IF p_accent_hex !~ '^#[0-9a-fA-F]{6}$' THEN
    RAISE EXCEPTION 'ACCENT_INVALID' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_before FROM public.minisite WHERE shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  UPDATE public.minisite
  SET
    template = p_template,
    accent_hex = p_accent_hex,
    content = COALESCE(p_content, '{}'::jsonb)
  WHERE shop_id = p_shop_id;

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
    p_shop_id,
    auth.uid(),
    'platform'::public.actor_type,
    'minisite.updated',
    'minisite',
    p_shop_id::text,
    jsonb_build_object(
      'before', jsonb_build_object(
        'template', v_before.template,
        'accent_hex', v_before.accent_hex,
        'content', v_before.content
      ),
      'after', jsonb_build_object(
        'template', p_template,
        'accent_hex', p_accent_hex,
        'content', COALESCE(p_content, '{}'::jsonb)
      )
    )
  );

  RETURN jsonb_build_object(
    'shop_id', p_shop_id,
    'template', p_template,
    'accent_hex', p_accent_hex
  );
END;
$$;

REVOKE ALL ON FUNCTION public.platform_update_minisite(uuid, public.minisite_template, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_update_minisite(uuid, public.minisite_template, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.platform_set_minisite_managed(
  p_shop_id uuid,
  p_managed boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_before boolean;
BEGIN
  PERFORM public.require_platform_admin();

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT minisite_managed INTO v_before FROM public.shops WHERE id = p_shop_id;

  UPDATE public.shops
  SET minisite_managed = COALESCE(p_managed, false)
  WHERE id = p_shop_id;

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
    p_shop_id,
    auth.uid(),
    'platform'::public.actor_type,
    'shop.minisite_managed',
    'shops',
    p_shop_id::text,
    jsonb_build_object(
      'before', jsonb_build_object('minisite_managed', v_before),
      'after', jsonb_build_object('minisite_managed', COALESCE(p_managed, false))
    )
  );

  RETURN jsonb_build_object('minisite_managed', COALESCE(p_managed, false));
END;
$$;

REVOKE ALL ON FUNCTION public.platform_set_minisite_managed(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_set_minisite_managed(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.platform_get_shop(p_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_minisite public.minisite;
BEGIN
  PERFORM public.require_platform_admin();

  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_minisite FROM public.minisite WHERE shop_id = p_shop_id;

  RETURN jsonb_build_object(
    'id', v_shop.id,
    'slug', v_shop.slug,
    'name', v_shop.name,
    'status', v_shop.status,
    'created_at', v_shop.created_at,
    'timezone', v_shop.timezone,
    'booking_lead_time_min', v_shop.booking_lead_time_min,
    'cancellation_window_min', v_shop.cancellation_window_min,
    'slot_granularity_min', v_shop.slot_granularity_min,
    'booking_auto_assign_barber', v_shop.booking_auto_assign_barber,
    'reminders_enabled', v_shop.reminders_enabled,
    'minisite_managed', v_shop.minisite_managed,
    'owner_user_id', (
      SELECT m.user_id
      FROM public.memberships m
      WHERE m.shop_id = p_shop_id
        AND m.role = 'owner'::public.membership_role
        AND m.archived_at IS NULL
      ORDER BY m.created_at
      LIMIT 1
    ),
    'owner_display_name', (
      SELECT p.display_name
      FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.user_id
      WHERE m.shop_id = p_shop_id AND m.role = 'owner'::public.membership_role AND m.archived_at IS NULL
      ORDER BY m.created_at LIMIT 1
    ),
    'owner_email', (
      SELECT u.email::text
      FROM public.memberships m
      INNER JOIN auth.users u ON u.id = m.user_id
      WHERE m.shop_id = p_shop_id AND m.role = 'owner'::public.membership_role AND m.archived_at IS NULL
      ORDER BY m.created_at LIMIT 1
    ),
    'staff_count', (
      SELECT pg_catalog.count(*)::integer FROM public.memberships m
      WHERE m.shop_id = p_shop_id AND m.archived_at IS NULL
    ),
    'bookings_last_30d', (
      SELECT pg_catalog.count(*)::integer FROM public.appointments a
      WHERE a.shop_id = p_shop_id AND a.created_at >= pg_catalog.now() - interval '30 days'
    ),
    'dead_outbox_count', (
      SELECT pg_catalog.count(*)::integer FROM public.notification_outbox no
      WHERE no.shop_id = p_shop_id AND no.status = 'dead'::public.outbox_status
    ),
    'minisite_template', v_minisite.template,
    'minisite_accent_hex', v_minisite.accent_hex,
    'allowed_minisite_templates', COALESCE(
      (
        SELECT jsonb_agg(t.val ORDER BY t.ord)
        FROM unnest(v_shop.allowed_minisite_templates) WITH ORDINALITY AS t(val, ord)
      ),
      '[]'::jsonb
    ),
    'outbox_by_template', COALESCE((
      SELECT jsonb_object_agg(t.template, t.stats)
      FROM (
        SELECT
          no.template::text AS template,
          jsonb_build_object(
            'sent', pg_catalog.count(*) FILTER (WHERE no.status = 'sent'::public.outbox_status),
            'pending', pg_catalog.count(*) FILTER (WHERE no.status = 'pending'::public.outbox_status),
            'failed', pg_catalog.count(*) FILTER (WHERE no.status = 'failed'::public.outbox_status),
            'dead', pg_catalog.count(*) FILTER (WHERE no.status = 'dead'::public.outbox_status),
            'skipped', pg_catalog.count(*) FILTER (WHERE no.status = 'skipped'::public.outbox_status)
          ) AS stats
        FROM public.notification_outbox no
        WHERE no.shop_id = p_shop_id
        GROUP BY no.template
      ) t
    ), '{}'::jsonb),
    'audit_trail', COALESCE((
      SELECT jsonb_agg(row_to_json(a))
      FROM (
        SELECT al.action, al.actor_type, al.entity, al.entity_id, al.diff, al.created_at
        FROM public.audit_logs al
        WHERE al.shop_id = p_shop_id
        ORDER BY al.created_at DESC
        LIMIT 20
      ) a
    ), '[]'::jsonb)
  );
END;
$$;
