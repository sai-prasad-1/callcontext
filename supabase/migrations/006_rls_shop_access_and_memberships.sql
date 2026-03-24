-- =============================================
-- Tenant access via shop_ids_for_current_user()
-- + shop_memberships RLS
-- + Replace tenant policies to include invited staff
-- =============================================

-- Returns all shop UUIDs the current user may access (owner or active membership).
CREATE OR REPLACE FUNCTION public.shop_ids_for_current_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

REVOKE ALL ON FUNCTION public.shop_ids_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shop_ids_for_current_user() TO authenticated;

-- ---------- shop_memberships ----------
CREATE POLICY "Users can read relevant memberships"
  ON shop_memberships FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = shop_memberships.shop_id AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM shop_memberships m
      WHERE m.shop_id = shop_memberships.shop_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND m.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Shop owners can insert memberships"
  ON shop_memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update memberships"
  ON shop_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = shop_memberships.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can delete memberships"
  ON shop_memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = shop_memberships.shop_id AND s.owner_id = auth.uid()
    )
  );

-- ---------- shops ----------
DROP POLICY IF EXISTS "Users can view their own shops" ON shops;
DROP POLICY IF EXISTS "Users can update their own shops" ON shops;

CREATE POLICY "Users can view accessible shops"
  ON shops FOR SELECT
  USING (id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Owners and managers can update shops"
  ON shops FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM shop_memberships m
      WHERE m.shop_id = shops.id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND m.role IN ('owner', 'manager')
    )
  );

-- ---------- customers ----------
DROP POLICY IF EXISTS "Shops can view their own customers" ON customers;
DROP POLICY IF EXISTS "Shops can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Shops can update their own customers" ON customers;
DROP POLICY IF EXISTS "Shops can delete their own customers" ON customers;

CREATE POLICY "Shops can view their own customers"
  ON customers FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own customers"
  ON customers FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own customers"
  ON customers FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- calls ----------
DROP POLICY IF EXISTS "Shops can view their own calls" ON calls;
DROP POLICY IF EXISTS "Shops can insert their own calls" ON calls;
DROP POLICY IF EXISTS "Shops can update their own calls" ON calls;

CREATE POLICY "Shops can view their own calls"
  ON calls FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own calls"
  ON calls FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own calls"
  ON calls FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- orders ----------
DROP POLICY IF EXISTS "Shops can view their own orders" ON orders;
DROP POLICY IF EXISTS "Shops can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Shops can update their own orders" ON orders;
DROP POLICY IF EXISTS "Shops can delete their own orders" ON orders;

CREATE POLICY "Shops can view their own orders"
  ON orders FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own orders"
  ON orders FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own orders"
  ON orders FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- reminders ----------
DROP POLICY IF EXISTS "Shops can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Shops can insert their own reminders" ON reminders;
DROP POLICY IF EXISTS "Shops can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Shops can delete their own reminders" ON reminders;

CREATE POLICY "Shops can view their own reminders"
  ON reminders FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own reminders"
  ON reminders FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own reminders"
  ON reminders FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- notes ----------
DROP POLICY IF EXISTS "Shops can view their own notes" ON notes;
DROP POLICY IF EXISTS "Shops can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Shops can update their own notes" ON notes;
DROP POLICY IF EXISTS "Shops can delete their own notes" ON notes;

CREATE POLICY "Shops can view their own notes"
  ON notes FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own notes"
  ON notes FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own notes"
  ON notes FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- tasks ----------
DROP POLICY IF EXISTS "Shops can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Shops can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Shops can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Shops can delete their own tasks" ON tasks;

CREATE POLICY "Shops can view their own tasks"
  ON tasks FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own tasks"
  ON tasks FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own tasks"
  ON tasks FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- loyalty_transactions ----------
DROP POLICY IF EXISTS "Shops can view their own loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Shops can insert their own loyalty transactions" ON loyalty_transactions;

CREATE POLICY "Shops can view their own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own loyalty transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- campaigns ----------
DROP POLICY IF EXISTS "Shops can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Shops can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Shops can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Shops can delete their own campaigns" ON campaigns;

CREATE POLICY "Shops can view their own campaigns"
  ON campaigns FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- integrations ----------
DROP POLICY IF EXISTS "Shops can view their own integrations" ON integrations;
DROP POLICY IF EXISTS "Shops can insert their own integrations" ON integrations;
DROP POLICY IF EXISTS "Shops can update their own integrations" ON integrations;
DROP POLICY IF EXISTS "Shops can delete their own integrations" ON integrations;

CREATE POLICY "Shops can view their own integrations"
  ON integrations FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own integrations"
  ON integrations FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own integrations"
  ON integrations FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- webhook_endpoints ----------
DROP POLICY IF EXISTS "Shops can view their own webhook endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Shops can insert their own webhook endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Shops can update their own webhook endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Shops can delete their own webhook endpoints" ON webhook_endpoints;

CREATE POLICY "Shops can view their own webhook endpoints"
  ON webhook_endpoints FOR SELECT
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can insert their own webhook endpoints"
  ON webhook_endpoints FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can update their own webhook endpoints"
  ON webhook_endpoints FOR UPDATE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

CREATE POLICY "Shops can delete their own webhook endpoints"
  ON webhook_endpoints FOR DELETE
  USING (shop_id IN (SELECT public.shop_ids_for_current_user()));

-- ---------- webhook_deliveries ----------
DROP POLICY IF EXISTS "Shops can view their own webhook deliveries" ON webhook_deliveries;
DROP POLICY IF EXISTS "Shops can insert their own webhook deliveries" ON webhook_deliveries;

CREATE POLICY "Shops can view their own webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    webhook_endpoint_id IN (
      SELECT id FROM webhook_endpoints
      WHERE shop_id IN (SELECT public.shop_ids_for_current_user())
    )
  );

CREATE POLICY "Shops can insert their own webhook deliveries"
  ON webhook_deliveries FOR INSERT
  WITH CHECK (
    webhook_endpoint_id IN (
      SELECT id FROM webhook_endpoints
      WHERE shop_id IN (SELECT public.shop_ids_for_current_user())
    )
  );

-- ---------- waitlist (any active shop member) ----------
DROP POLICY IF EXISTS "Shop owners can view waitlist" ON waitlist;

CREATE POLICY "Shop members can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.shop_ids_for_current_user() AS sid)
  );
