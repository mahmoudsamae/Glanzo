-- Platform admin: show pending owner invite email + provision owner membership.

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
  v_owner_user_id uuid;
BEGIN
  PERFORM public.require_platform_admin();

  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_minisite FROM public.minisite WHERE shop_id = p_shop_id;

  SELECT m.user_id
  INTO v_owner_user_id
  FROM public.memberships m
  WHERE m.shop_id = p_shop_id
    AND m.role = 'owner'::public.membership_role
    AND m.archived_at IS NULL
  ORDER BY m.created_at
  LIMIT 1;

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
    'owner_user_id', v_owner_user_id,
    'owner_display_name', (
      SELECT p.display_name
      FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.user_id
      WHERE m.shop_id = p_shop_id AND m.role = 'owner'::public.membership_role AND m.archived_at IS NULL
      ORDER BY m.created_at LIMIT 1
    ),
    'owner_email', COALESCE(
      (
        SELECT u.email::text
        FROM auth.users u
        WHERE u.id = v_owner_user_id
      ),
      (
        SELECT si.email
        FROM public.staff_invites si
        WHERE si.shop_id = p_shop_id
          AND si.role = 'owner'::public.membership_role
          AND si.accepted_at IS NULL
        ORDER BY si.created_at DESC
        LIMIT 1
      )
    ),
    'owner_invite_pending', (
      v_owner_user_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.staff_invites si
        WHERE si.shop_id = p_shop_id
          AND si.role = 'owner'::public.membership_role
          AND si.accepted_at IS NULL
      )
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

CREATE OR REPLACE FUNCTION public.platform_lookup_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.id
  FROM auth.users u
  WHERE lower(u.email) = lower(btrim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.platform_lookup_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_lookup_user_id_by_email(text) TO service_role;

CREATE OR REPLACE FUNCTION public.platform_set_pending_owner_email(
  p_shop_id uuid,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_invite public.staff_invites;
BEGIN
  PERFORM public.require_platform_admin();

  IF p_email IS NULL OR btrim(p_email) = '' OR position('@' in p_email) < 2 THEN
    RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.shop_id = p_shop_id
      AND m.role = 'owner'::public.membership_role
      AND m.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'OWNER_EXISTS' USING ERRCODE = '22023';
  END IF;

  UPDATE public.staff_invites
  SET email = lower(btrim(p_email)), updated_at = pg_catalog.now()
  WHERE shop_id = p_shop_id
    AND role = 'owner'::public.membership_role
    AND accepted_at IS NULL
  RETURNING * INTO v_invite;

  IF NOT FOUND THEN
    INSERT INTO public.staff_invites (
      shop_id, email, role, token, expires_at, created_by
    )
    VALUES (
      p_shop_id,
      lower(btrim(p_email)),
      'owner'::public.membership_role,
      pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'),
      pg_catalog.now() + interval '30 days',
      v_actor
    )
    RETURNING * INTO v_invite;
  END IF;

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    p_shop_id,
    v_actor,
    'platform'::public.actor_type,
    'owner.pending_email_set',
    'staff_invite',
    v_invite.id,
    jsonb_build_object('email', v_invite.email)
  );

  RETURN jsonb_build_object('owner_email', v_invite.email);
END;
$$;

REVOKE ALL ON FUNCTION public.platform_set_pending_owner_email(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_set_pending_owner_email(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.platform_attach_owner_membership(
  p_shop_id uuid,
  p_user_id uuid,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_membership public.memberships;
BEGIN
  PERFORM public.require_platform_admin();

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_USER' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.shop_id = p_shop_id
      AND m.role = 'owner'::public.membership_role
      AND m.archived_at IS NULL
      AND m.user_id <> p_user_id
  ) THEN
    RAISE EXCEPTION 'OWNER_EXISTS' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (p_user_id, split_part(lower(btrim(p_email)), '@', 1))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.memberships (shop_id, user_id, role)
  VALUES (p_shop_id, p_user_id, 'owner'::public.membership_role)
  ON CONFLICT (user_id, shop_id) DO UPDATE
    SET role = 'owner'::public.membership_role,
        archived_at = NULL,
        updated_at = pg_catalog.now()
  RETURNING * INTO v_membership;

  UPDATE public.staff_invites
  SET accepted_at = pg_catalog.now(), updated_at = pg_catalog.now()
  WHERE shop_id = p_shop_id
    AND role = 'owner'::public.membership_role
    AND accepted_at IS NULL
    AND lower(email) = lower(btrim(p_email));

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    p_shop_id,
    v_actor,
    'platform'::public.actor_type,
    'owner.provisioned',
    'membership',
    v_membership.id,
    jsonb_build_object('user_id', p_user_id, 'email', lower(btrim(p_email)))
  );

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'membership_id', v_membership.id,
    'owner_email', lower(btrim(p_email))
  );
END;
$$;

REVOKE ALL ON FUNCTION public.platform_attach_owner_membership(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_attach_owner_membership(uuid, uuid, text) TO authenticated;
