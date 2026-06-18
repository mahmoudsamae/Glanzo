-- Platform admin: expose owner user id for credential management (operational metadata).

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
    'reminders_enabled', v_shop.reminders_enabled,
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
