-- Allow shop members (barbers) to update customer rows they can read.
-- Application layer restricts barber updates to notes-only; owners retain full update via existing policy.
CREATE POLICY customers_update_member
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (shop_id IN (SELECT public.user_shop_ids()))
  WITH CHECK (shop_id IN (SELECT public.user_shop_ids()));
