-- Forge — default allowed template for new shops (separate migration: enum value must be committed first).

ALTER TABLE public.shops
  ALTER COLUMN allowed_minisite_templates SET DEFAULT ARRAY['forge'::public.minisite_template];

COMMENT ON TYPE public.minisite_template IS
  'Public minisite visual template. Forge is the default barbershop layout.';
