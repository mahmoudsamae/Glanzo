-- NICOLES-style salon template (teal + gold + cream)
BEGIN;
ALTER TYPE public.minisite_template ADD VALUE IF NOT EXISTS 'nicoles';
COMMIT;
