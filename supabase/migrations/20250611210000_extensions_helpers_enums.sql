-- Migration 1: extensions, UUIDv7, updated_at helper, enums
-- Glanzo Phase 1 · forward-only

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- UUIDv7 (RFC 9562): 48-bit unix-ms timestamp + 74 random bits, version 7 / variant bits set.
-- Spec: https://www.rfc-editor.org/rfc/rfc9562.html#name-uuid-version-7
CREATE OR REPLACE FUNCTION public.uuid_v7()
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SET search_path = ''
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms := substring(
    int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint)
    FROM 3
  );
  uuid_bytes := unix_ts_ms || extensions.gen_random_bytes(10);
  uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
  uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$;

COMMENT ON FUNCTION public.uuid_v7() IS
  'Generates RFC 9562 UUID version 7 (time-ordered). Default PK generator for Glanzo tenant tables.';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE TYPE public.shop_status AS ENUM ('active', 'suspended');
CREATE TYPE public.membership_role AS ENUM ('owner', 'barber');
CREATE TYPE public.actor_type AS ENUM ('user', 'platform', 'system');
