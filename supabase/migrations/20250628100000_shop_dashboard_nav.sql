-- Per-shop dashboard sidebar visibility (platform admin only).

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS dashboard_nav_keys text[] DEFAULT NULL;

COMMENT ON COLUMN public.shops.dashboard_nav_keys IS
  'Platform-configured visible dashboard nav keys. NULL = all defaults for role.';

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
    'dashboard_nav_keys', COALESCE(
      (
        SELECT jsonb_agg(k ORDER BY ord)
        FROM unnest(v_shop.dashboard_nav_keys) WITH ORDINALITY AS t(k, ord)
      ),
      '[]'::jsonb
    ),
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

CREATE OR REPLACE FUNCTION public.platform_set_shop_dashboard_nav(
  p_shop_id uuid,
  p_nav_keys text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_allowed text[] := ARRAY[]::text[];
  v_key text;
  v_valid constant text[] := ARRAY[
    'today',
    'calendar',
    'customers',
    'services',
    'staff',
    'minisite',
    'settings'
  ];
BEGIN
  PERFORM public.require_platform_admin();

  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF p_nav_keys IS NULL OR pg_catalog.array_length(p_nav_keys, 1) IS NULL THEN
    UPDATE public.shops
    SET dashboard_nav_keys = NULL, updated_at = pg_catalog.now()
    WHERE id = p_shop_id;
  ELSE
    FOREACH v_key IN ARRAY p_nav_keys LOOP
      IF v_key = ANY (v_valid) AND NOT v_key = ANY (v_allowed) THEN
        v_allowed := pg_catalog.array_append(v_allowed, v_key);
      END IF;
    END LOOP;

    IF pg_catalog.array_length(v_allowed, 1) IS NULL THEN
      RAISE EXCEPTION 'NAV_KEYS_REQUIRED' USING ERRCODE = '22023';
    END IF;

    UPDATE public.shops
    SET dashboard_nav_keys = v_allowed, updated_at = pg_catalog.now()
    WHERE id = p_shop_id;
  END IF;

  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;

  RETURN jsonb_build_object(
    'dashboard_nav_keys', COALESCE(
      (
        SELECT jsonb_agg(k ORDER BY ord)
        FROM unnest(v_shop.dashboard_nav_keys) WITH ORDINALITY AS t(k, ord)
      ),
      '[]'::jsonb
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.platform_set_shop_dashboard_nav(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_set_shop_dashboard_nav(uuid, text[]) TO authenticated;
