BEGIN;
ALTER TYPE public.minisite_template ADD VALUE IF NOT EXISTS 'mecca';
COMMIT;
