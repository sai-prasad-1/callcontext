-- =============================================
-- Fix 42P17: infinite recursion on shop_memberships SELECT
-- =============================================
-- The SELECT policy must not subquery shop_memberships (re-enters the same policy).
-- Use shop_ids_for_current_user() instead, and run that helper with row_security off
-- so evaluating policies on shop_memberships does not recurse.

CREATE OR REPLACE FUNCTION public.shop_ids_for_current_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT s.id
  FROM shops s
  WHERE s.owner_id = auth.uid()
  UNION
  SELECT m.shop_id
  FROM shop_memberships m
  WHERE m.user_id = auth.uid()
    AND m.status = 'active';
$$;

DROP POLICY IF EXISTS "Users can read relevant memberships" ON shop_memberships;

-- Own row: always readable (e.g. invited / suspended still sees their row).
-- Same-shop peers: shop_id must appear in helper (active member or shop owner).
CREATE POLICY "Users can read relevant memberships"
  ON shop_memberships FOR SELECT
  USING (
    user_id = auth.uid()
    OR shop_id IN (SELECT public.shop_ids_for_current_user())
  );
