-- Migration 2: Phase 1 tables + RLS (default-deny, policies in same file)
-- Glanzo Phase 1 · five tables only

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_valid_iana_timezone(tz text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  IF tz IS NULL OR btrim(tz) = '' THEN
    RETURN false;
  END IF;
  PERFORM pg_catalog.timezone(tz, pg_catalog.now());
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- opening_hours shape (validated in app via zod):
-- { mon: null | { open: "09:00", close: "19:00" }, tue: ..., wed: ..., thu: ..., fri: ..., sat: ..., sun: ... }

-- ---------------------------------------------------------------------------
-- shops
-- ---------------------------------------------------------------------------

CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  slug text NOT NULL,
  name text NOT NULL,
  status public.shop_status NOT NULL DEFAULT 'active',
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  currency char(3) NOT NULL DEFAULT 'EUR',
  opening_hours jsonb NOT NULL DEFAULT '{
    "mon": null,
    "tue": {"open": "09:00", "close": "19:00"},
    "wed": {"open": "09:00", "close": "19:00"},
    "thu": {"open": "09:00", "close": "19:00"},
    "fri": {"open": "09:00", "close": "19:00"},
    "sat": {"open": "09:00", "close": "17:00"},
    "sun": null
  }'::jsonb,
  booking_lead_time_min integer NOT NULL DEFAULT 60,
  cancellation_window_min integer NOT NULL DEFAULT 120,
  slot_granularity_min integer NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shops_slug_format CHECK (
    slug ~ '^[a-z0-9](-?[a-z0-9])*$'
    AND char_length(slug) BETWEEN 3 AND 40
  ),
  CONSTRAINT shops_booking_lead_time_nonneg CHECK (booking_lead_time_min >= 0),
  CONSTRAINT shops_cancellation_window_nonneg CHECK (cancellation_window_min >= 0),
  CONSTRAINT shops_slot_granularity_allowed CHECK (
    slot_granularity_min IN (5, 10, 15, 20, 30, 60)
  ),
  CONSTRAINT shops_timezone_valid CHECK (public.is_valid_iana_timezone(timezone))
);

CREATE UNIQUE INDEX shops_slug_key ON public.shops (slug);

CREATE TRIGGER shops_set_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.prevent_shop_slug_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    RAISE EXCEPTION 'shop slug is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER shops_prevent_slug_change
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_shop_slug_change();

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role public.membership_role NOT NULL,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memberships_user_shop_unique UNIQUE (user_id, shop_id),
  CONSTRAINT memberships_shop_id_id_unique UNIQUE (shop_id, id)
);

CREATE INDEX memberships_user_id_active_idx
  ON public.memberships (user_id)
  WHERE archived_at IS NULL;

CREATE INDEX memberships_shop_id_active_idx
  ON public.memberships (shop_id)
  WHERE archived_at IS NULL;

CREATE TRIGGER memberships_set_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- platform_admins
-- ---------------------------------------------------------------------------

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- audit_logs (append-only)
-- ---------------------------------------------------------------------------

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid REFERENCES public.shops (id) ON DELETE SET NULL,
  actor_id uuid,
  actor_type public.actor_type NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  diff jsonb,
  ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_shop_id_created_at_idx
  ON public.audit_logs (shop_id, created_at DESC);

REVOKE UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS helper functions (SECURITY DEFINER, search_path pinned)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins pa
    WHERE pa.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_shop_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT m.shop_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid()
    AND m.archived_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_shop_owner(p_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.shop_id = p_shop_id
      AND m.user_id = auth.uid()
      AND m.role = 'owner'::public.membership_role
      AND m.archived_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_shop_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_shop_owner(uuid) TO authenticated, service_role;

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
    IF public.is_platform_admin() THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'only platform admins may change shop status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER shops_protect_status_change
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_shop_status_change();

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY shops_select_member_or_admin
  ON public.shops
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY shops_update_owner
  ON public.shops
  FOR UPDATE
  TO authenticated
  USING (public.is_shop_owner(id))
  WITH CHECK (public.is_shop_owner(id));

CREATE POLICY profiles_select_self_shopmates_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.memberships viewer
      INNER JOIN public.memberships subject
        ON viewer.shop_id = subject.shop_id
      WHERE viewer.user_id = auth.uid()
        AND viewer.archived_at IS NULL
        AND subject.user_id = profiles.id
        AND subject.archived_at IS NULL
    )
  );

CREATE POLICY profiles_update_self
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY memberships_select_member_or_admin
  ON public.memberships
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY platform_admins_select_admin
  ON public.platform_admins
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY audit_logs_select_owner_or_admin
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin()
    OR (shop_id IS NOT NULL AND public.is_shop_owner(shop_id))
  );

-- ---------------------------------------------------------------------------
-- Table grants (RLS filters on top)
-- ---------------------------------------------------------------------------

GRANT SELECT, UPDATE ON public.shops TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.memberships TO authenticated;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
