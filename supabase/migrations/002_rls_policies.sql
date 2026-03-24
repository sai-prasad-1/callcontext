-- =============================================
-- CallContext RLS (Row Level Security) Policies
-- =============================================
-- This enforces multi-tenancy at the database level
-- Run this AFTER running 001_initial_schema.sql

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: shops
-- =============================================
-- Users can see their own shops
CREATE POLICY "Users can view their own shops"
  ON shops FOR SELECT
  USING (owner_id = auth.uid());

-- Users can update their own shops
CREATE POLICY "Users can update their own shops"
  ON shops FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can insert shops (for signup) - CRITICAL: must allow during signup
CREATE POLICY "Users can create shops"
  ON shops FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow service role to bypass RLS (for admin operations)
-- This is automatically handled by Supabase when using service_role key

-- =============================================
-- RLS POLICIES: customers
-- =============================================
-- Shops can only see their own customers
CREATE POLICY "Shops can view their own customers"
  ON customers FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own customers"
  ON customers FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own customers"
  ON customers FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: calls
-- =============================================
CREATE POLICY "Shops can view their own calls"
  ON calls FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own calls"
  ON calls FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own calls"
  ON calls FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: orders
-- =============================================
CREATE POLICY "Shops can view their own orders"
  ON orders FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own orders"
  ON orders FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own orders"
  ON orders FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: reminders
-- =============================================
CREATE POLICY "Shops can view their own reminders"
  ON reminders FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own reminders"
  ON reminders FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own reminders"
  ON reminders FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: notes
-- =============================================
CREATE POLICY "Shops can view their own notes"
  ON notes FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own notes"
  ON notes FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own notes"
  ON notes FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: tasks
-- =============================================
CREATE POLICY "Shops can view their own tasks"
  ON tasks FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own tasks"
  ON tasks FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own tasks"
  ON tasks FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: loyalty_transactions
-- =============================================
CREATE POLICY "Shops can view their own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own loyalty transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: campaigns
-- =============================================
CREATE POLICY "Shops can view their own campaigns"
  ON campaigns FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: integrations
-- =============================================
CREATE POLICY "Shops can view their own integrations"
  ON integrations FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own integrations"
  ON integrations FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own integrations"
  ON integrations FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: webhook_endpoints
-- =============================================
CREATE POLICY "Shops can view their own webhook endpoints"
  ON webhook_endpoints FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can insert their own webhook endpoints"
  ON webhook_endpoints FOR INSERT
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can update their own webhook endpoints"
  ON webhook_endpoints FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shops can delete their own webhook endpoints"
  ON webhook_endpoints FOR DELETE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: webhook_deliveries
-- =============================================
CREATE POLICY "Shops can view their own webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    webhook_endpoint_id IN (
      SELECT id FROM webhook_endpoints WHERE shop_id IN (
        SELECT id FROM shops WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Shops can insert their own webhook deliveries"
  ON webhook_deliveries FOR INSERT
  WITH CHECK (
    webhook_endpoint_id IN (
      SELECT id FROM webhook_endpoints WHERE shop_id IN (
        SELECT id FROM shops WHERE owner_id = auth.uid()
      )
    )
  );
