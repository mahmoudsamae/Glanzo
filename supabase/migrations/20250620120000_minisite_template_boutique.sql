-- Boutique mobile-first salon layout (Premium Boutique starter kit)
BEGIN;
ALTER TYPE public.minisite_template ADD VALUE IF NOT EXISTS 'boutique';
COMMIT;
