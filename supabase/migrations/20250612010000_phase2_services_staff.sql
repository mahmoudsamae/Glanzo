-- Migration 6: Phase 2 — services catalog, staff hours, invites
-- Glanzo Phase 2 · five new tables + accept_staff_invite RPC + RLS in same file

-- Weekday convention (documented once, reused in app + DB):
--   staff_hours.weekday smallint 0–6 where 0 = Monday, 6 = Sunday (ISO weekday minus 1).

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_membership_id(p_shop_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT m.id
  FROM public.memberships m
  WHERE m.shop_id = p_shop_id
    AND m.user_id = auth.uid()
    AND m.archived_at IS NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.user_membership_id(uuid) IS
  'Active membership id for auth.uid() in the given shop. Used by staff_hours/time_off barber-scoped RLS.';

GRANT EXECUTE ON FUNCTION public.user_membership_id(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_min integer NOT NULL,
  price_cents integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT services_name_length CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  CONSTRAINT services_duration_valid CHECK (
    duration_min > 0
    AND duration_min <= 480
    AND duration_min % 5 = 0
  ),
  CONSTRAINT services_price_nonneg CHECK (price_cents >= 0),
  CONSTRAINT services_shop_id_id_unique UNIQUE (shop_id, id)
);

COMMENT ON CONSTRAINT services_shop_id_id_unique ON public.services IS
  'Composite-FK anchor: child tables reference (shop_id, id) to prevent cross-tenant service id reuse.';

CREATE UNIQUE INDEX services_shop_name_active_key
  ON public.services (shop_id, name)
  WHERE archived_at IS NULL;

CREATE INDEX services_shop_sort_active_idx
  ON public.services (shop_id, sort_order)
  WHERE archived_at IS NULL;

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- service_staff (barber ↔ service assignment)
-- ---------------------------------------------------------------------------

CREATE TABLE public.service_staff (
  shop_id uuid NOT NULL,
  service_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (service_id, membership_id),
  CONSTRAINT service_staff_service_fk
    FOREIGN KEY (shop_id, service_id)
    REFERENCES public.services (shop_id, id)
    ON DELETE CASCADE,
  CONSTRAINT service_staff_membership_fk
    FOREIGN KEY (shop_id, membership_id)
    REFERENCES public.memberships (shop_id, id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.service_staff IS
  'Composite FKs on (shop_id, *) make cross-shop service↔barber assignment unrepresentable.';

-- ---------------------------------------------------------------------------
-- staff_hours (split shifts = multiple rows per membership + weekday)
-- ---------------------------------------------------------------------------

CREATE TABLE public.staff_hours (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  weekday smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_hours_weekday_range CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT staff_hours_time_order CHECK (end_time > start_time),
  CONSTRAINT staff_hours_membership_fk
    FOREIGN KEY (shop_id, membership_id)
    REFERENCES public.memberships (shop_id, id)
    ON DELETE CASCADE,
  CONSTRAINT staff_hours_no_overlap
    EXCLUDE USING gist (
      membership_id WITH =,
      weekday WITH =,
      tsrange(
        ('1970-01-01'::date + start_time)::timestamp,
        ('1970-01-01'::date + end_time)::timestamp,
        '[)'
      ) WITH &&
    )
);

CREATE INDEX staff_hours_shop_membership_idx
  ON public.staff_hours (shop_id, membership_id);

CREATE TRIGGER staff_hours_set_updated_at
  BEFORE UPDATE ON public.staff_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- time_off
-- ---------------------------------------------------------------------------

CREATE TABLE public.time_off (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT time_off_range CHECK (ends_at > starts_at),
  CONSTRAINT time_off_membership_fk
    FOREIGN KEY (shop_id, membership_id)
    REFERENCES public.memberships (shop_id, id)
    ON DELETE CASCADE,
  CONSTRAINT time_off_no_overlap
    EXCLUDE USING gist (
      membership_id WITH =,
      tstzrange(starts_at, ends_at, '[)') WITH &&
    )
);

CREATE INDEX time_off_membership_starts_idx
  ON public.time_off (membership_id, starts_at);

-- ---------------------------------------------------------------------------
-- staff_invites
-- ---------------------------------------------------------------------------

CREATE TABLE public.staff_invites (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  email extensions.citext NOT NULL,
  role public.membership_role NOT NULL DEFAULT 'barber',
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_invites_token_length CHECK (char_length(token) >= 32),
  CONSTRAINT staff_invites_role_barber_only CHECK (role = 'barber'::public.membership_role)
);

CREATE UNIQUE INDEX staff_invites_token_key ON public.staff_invites (token);

CREATE UNIQUE INDEX staff_invites_shop_email_pending_key
  ON public.staff_invites (shop_id, email)
  WHERE accepted_at IS NULL;

CREATE TRIGGER staff_invites_set_updated_at
  BEFORE UPDATE ON public.staff_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- services: members SELECT; owner writes
CREATE POLICY services_select_member_or_admin
  ON public.services
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY services_insert_owner
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY services_update_owner
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.is_shop_owner(shop_id))
  WITH CHECK (public.is_shop_owner(shop_id));

-- service_staff: members SELECT; owner writes
CREATE POLICY service_staff_select_member_or_admin
  ON public.service_staff
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY service_staff_insert_owner
  ON public.service_staff
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY service_staff_delete_owner
  ON public.service_staff
  FOR DELETE
  TO authenticated
  USING (public.is_shop_owner(shop_id));

-- staff_hours: members SELECT; owner any row; barber own membership only
CREATE POLICY staff_hours_select_member_or_admin
  ON public.staff_hours
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY staff_hours_insert_owner_or_self
  ON public.staff_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

CREATE POLICY staff_hours_update_owner_or_self
  ON public.staff_hours
  FOR UPDATE
  TO authenticated
  USING (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  )
  WITH CHECK (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

CREATE POLICY staff_hours_delete_owner_or_self
  ON public.staff_hours
  FOR DELETE
  TO authenticated
  USING (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

-- time_off: same scoping as staff_hours
CREATE POLICY time_off_select_member_or_admin
  ON public.time_off
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY time_off_insert_owner_or_self
  ON public.time_off
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

CREATE POLICY time_off_update_owner_or_self
  ON public.time_off
  FOR UPDATE
  TO authenticated
  USING (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  )
  WITH CHECK (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

CREATE POLICY time_off_delete_owner_or_self
  ON public.time_off
  FOR DELETE
  TO authenticated
  USING (
    public.is_shop_owner(shop_id)
    OR membership_id = public.user_membership_id(shop_id)
  );

-- staff_invites: owner SELECT/INSERT/DELETE for own shop only
CREATE POLICY staff_invites_select_owner
  ON public.staff_invites
  FOR SELECT
  TO authenticated
  USING (public.is_shop_owner(shop_id));

CREATE POLICY staff_invites_insert_owner
  ON public.staff_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_shop_owner(shop_id)
    AND created_by = auth.uid()
  );

CREATE POLICY staff_invites_delete_owner
  ON public.staff_invites
  FOR DELETE
  TO authenticated
  USING (public.is_shop_owner(shop_id));

-- ---------------------------------------------------------------------------
-- Table grants
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.services TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.service_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_hours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_off TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.staff_invites TO authenticated;

-- ---------------------------------------------------------------------------
-- accept_staff_invite RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.accept_staff_invite(p_token text)
RETURNS public.memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_invite public.staff_invites;
  v_membership public.memberships;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED'
      USING ERRCODE = '42501';
  END IF;

  IF p_token IS NULL OR btrim(p_token) = '' THEN
    RAISE EXCEPTION 'INVITE_INVALID'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_invite
  FROM public.staff_invites si
  WHERE si.token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITE_INVALID'
      USING ERRCODE = '22023';
  END IF;

  IF v_invite.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'INVITE_INVALID'
      USING ERRCODE = '22023';
  END IF;

  IF v_invite.expires_at <= now() THEN
    RAISE EXCEPTION 'INVITE_EXPIRED'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.shop_id = v_invite.shop_id
      AND m.user_id = v_user_id
      AND m.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'ALREADY_MEMBER'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.memberships (shop_id, user_id, role)
  VALUES (v_invite.shop_id, v_user_id, v_invite.role)
  RETURNING * INTO v_membership;

  UPDATE public.staff_invites
  SET accepted_at = now()
  WHERE id = v_invite.id;

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
    v_invite.shop_id,
    v_user_id,
    'user'::public.actor_type,
    'invite.accepted',
    'membership',
    v_membership.id,
    jsonb_build_object(
      'invite_id', v_invite.id,
      'email', v_invite.email,
      'role', v_invite.role
    )
  );

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
    v_invite.shop_id,
    v_user_id,
    'user'::public.actor_type,
    'membership.created',
    'membership',
    v_membership.id,
    jsonb_build_object('role', v_invite.role, 'via', 'invite')
  );

  RETURN v_membership;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text) TO authenticated;
REVOKE ALL ON FUNCTION public.accept_staff_invite(text) FROM anon, public;

COMMENT ON FUNCTION public.accept_staff_invite(text) IS
  'Atomic invite acceptance: validate token → membership → mark accepted → audit rows. Token lookup is server-side only.';

COMMENT ON POLICY memberships_select_member_or_admin ON public.memberships IS
  'SELECT only for members/admins. INSERT via create_shop_with_owner or accept_staff_invite (Phase 2).';
