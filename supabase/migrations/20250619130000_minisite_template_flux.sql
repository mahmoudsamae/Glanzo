-- Urban "flux" mini-site layout (Electric Flux starter kit)
BEGIN;
ALTER TYPE public.minisite_template ADD VALUE IF NOT EXISTS 'flux';
COMMIT;
