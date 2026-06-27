-- Forge — add enum value (must commit before using 'forge' elsewhere).
BEGIN;
ALTER TYPE public.minisite_template ADD VALUE IF NOT EXISTS 'forge';
COMMIT;
