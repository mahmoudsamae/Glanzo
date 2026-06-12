-- Public mini-site read for anon: column-level grant + RLS (no whole-table exposure).
-- Sensitive columns (booking rules, currency internals) remain inaccessible to anon.

GRANT SELECT (slug, name, status, timezone, opening_hours) ON public.shops TO anon;

CREATE POLICY shops_select_anon_minisite
  ON public.shops
  FOR SELECT
  TO anon
  USING (true);

COMMENT ON POLICY shops_select_anon_minisite ON public.shops IS
  'Mini-site placeholder: anon may read non-sensitive shop columns only (see column GRANT).';
