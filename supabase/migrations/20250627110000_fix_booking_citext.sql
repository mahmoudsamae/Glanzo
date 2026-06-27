-- Booking failed with: type "extensions.citext" does not exist (Postgres 42704)
-- when book_appointment casts customer email. Ensure citext is installed and stop
-- referencing the type explicitly in the RPC (column coercion is enough).

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_shop_slug text,
  p_service_id uuid,
  p_membership_id uuid,
  p_starts_at timestamptz,
  p_name text,
  p_phone text,
  p_email text,
  p_idempotency_key text,
  p_client_ip inet DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_service public.services;
  v_membership_id uuid;
  v_customer_id uuid;
  v_appointment public.appointments;
  v_existing public.appointments;
  v_manage_token text;
  v_ends_at timestamptz;
  v_phone_active integer;
  v_attempt_count integer;
  v_customer_email text;
  v_service_staff_linked boolean;
BEGIN
  IF p_idempotency_key IS NULL OR btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
  INTO v_existing
  FROM public.booking_requests br
  INNER JOIN public.appointments a
    ON a.shop_id = br.shop_id AND a.id = br.appointment_id
  WHERE br.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'shop_id', v_existing.shop_id,
      'manage_token', v_existing.manage_token,
      'starts_at', v_existing.starts_at,
      'ends_at', v_existing.ends_at,
      'idempotent_replay', true
    );
  END IF;

  IF p_name IS NULL OR char_length(btrim(p_name)) < 2 OR char_length(btrim(p_name)) > 80 THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_phone IS NULL OR NOT public.is_valid_e164_phone(p_phone) THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_starts_at IS NULL THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_shop
  FROM public.shops s
  WHERE s.slug = p_shop_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF v_shop.status <> 'active'::public.shop_status THEN
    RAISE EXCEPTION 'SHOP_SUSPENDED' USING ERRCODE = '22023';
  END IF;

  IF p_client_ip IS NOT NULL THEN
    DELETE FROM public.booking_attempts ba
    WHERE ba.shop_id = v_shop.id
      AND ba.attempted_at < pg_catalog.now() - interval '1 hour';

    SELECT pg_catalog.count(*)::integer
    INTO v_attempt_count
    FROM public.booking_attempts ba
    WHERE ba.shop_id = v_shop.id
      AND ba.ip = p_client_ip
      AND ba.attempted_at > pg_catalog.now() - interval '1 hour';

    IF v_attempt_count >= 10 THEN
      RAISE EXCEPTION 'RATE_LIMITED' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.booking_attempts (shop_id, ip)
    VALUES (v_shop.id, p_client_ip);
  END IF;

  SELECT pg_catalog.count(*)::integer
  INTO v_phone_active
  FROM public.appointments a
  INNER JOIN public.customers c
    ON c.shop_id = a.shop_id AND c.id = a.customer_id
  WHERE a.shop_id = v_shop.id
    AND c.phone = p_phone
    AND a.status = 'booked'::public.appointment_status
    AND a.starts_at > pg_catalog.now();

  IF v_phone_active >= 3 THEN
    RAISE EXCEPTION 'PHONE_LIMIT' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_service
  FROM public.services s
  WHERE s.shop_id = v_shop.id
    AND s.id = p_service_id
    AND s.archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_starts_at < pg_catalog.now() + (v_shop.booking_lead_time_min || ' minutes')::interval THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  v_ends_at := p_starts_at + (v_service.duration_min || ' minutes')::interval;

  SELECT EXISTS (
    SELECT 1
    FROM public.service_staff ss
    WHERE ss.shop_id = v_shop.id
      AND ss.service_id = p_service_id
  )
  INTO v_service_staff_linked;

  IF p_membership_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.shop_id = v_shop.id
        AND m.id = p_membership_id
        AND m.archived_at IS NULL
        AND (
          v_service_staff_linked = false
          OR EXISTS (
            SELECT 1
            FROM public.service_staff ss
            WHERE ss.shop_id = v_shop.id
              AND ss.service_id = p_service_id
              AND ss.membership_id = m.id
          )
        )
    ) THEN
      RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
    END IF;
    v_membership_id := p_membership_id;
  ELSE
    SELECT eligible.id
    INTO v_membership_id
    FROM (
      SELECT m.id
      FROM public.memberships m
      WHERE m.shop_id = v_shop.id
        AND m.archived_at IS NULL
        AND (
          v_service_staff_linked = false
          OR EXISTS (
            SELECT 1
            FROM public.service_staff ss
            WHERE ss.shop_id = v_shop.id
              AND ss.service_id = p_service_id
              AND ss.membership_id = m.id
          )
        )
    ) AS eligible(id)
    ORDER BY (
      SELECT pg_catalog.count(*)::integer
      FROM public.appointments a
      WHERE a.shop_id = v_shop.id
        AND a.membership_id = eligible.id
        AND a.status IN ('booked'::public.appointment_status, 'completed'::public.appointment_status)
        AND (a.starts_at AT TIME ZONE v_shop.timezone)::date = (p_starts_at AT TIME ZONE v_shop.timezone)::date
    ), eligible.id
    LIMIT 1;

    IF v_membership_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.customers (shop_id, name, phone, email)
  VALUES (
    v_shop.id,
    btrim(p_name),
    p_phone,
    NULLIF(btrim(p_email), '')
  )
  ON CONFLICT ON CONSTRAINT customers_shop_phone_unique
  DO UPDATE SET
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, public.customers.email),
    updated_at = pg_catalog.now()
  RETURNING id, email::text INTO v_customer_id, v_customer_email;

  SELECT pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'::text) INTO v_manage_token;

  BEGIN
    INSERT INTO public.appointments (
      shop_id,
      customer_id,
      membership_id,
      service_id,
      starts_at,
      ends_at,
      status,
      service_name,
      price_cents,
      source,
      manage_token
    )
    VALUES (
      v_shop.id,
      v_customer_id,
      v_membership_id,
      v_service.id,
      p_starts_at,
      v_ends_at,
      'booked'::public.appointment_status,
      v_service.name,
      v_service.price_cents,
      'online'::public.appointment_source,
      v_manage_token
    )
    RETURNING * INTO v_appointment;
  EXCEPTION
    WHEN exclusion_violation THEN
      RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23505';
  END;

  PERFORM public.enqueue_booking_outbox_rows(
    v_shop.id,
    v_appointment.id,
    v_appointment.starts_at,
    v_customer_email
  );

  INSERT INTO public.booking_requests (idempotency_key, shop_id, appointment_id)
  VALUES (p_idempotency_key, v_shop.id, v_appointment.id);

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
    NULL,
    'system'::public.actor_type,
    'appointment.booked',
    'appointment',
    v_appointment.id,
    jsonb_build_object(
      'source', 'online',
      'service_id', v_service.id,
      'membership_id', v_membership_id,
      'customer_id', v_customer_id
    )
  );

  RETURN jsonb_build_object(
    'id', v_appointment.id,
    'shop_id', v_appointment.shop_id,
    'manage_token', v_appointment.manage_token,
    'starts_at', v_appointment.starts_at,
    'ends_at', v_appointment.ends_at,
    'idempotent_replay', false
  );
END;
$$;
