-- =============================================
-- CallContext Database Indexes
-- =============================================
-- Performance-critical indexes for fast queries
-- Run this AFTER running 001 and 002

-- =============================================
-- INDEXES: shops
-- =============================================
CREATE INDEX idx_shops_owner ON shops(owner_id);
CREATE INDEX idx_shops_vonage_number ON shops(vonage_number) WHERE vonage_number IS NOT NULL;

-- =============================================
-- INDEXES: customers
-- =============================================
-- Critical: Fast caller lookup during incoming calls (< 50ms required)
CREATE UNIQUE INDEX idx_customers_shop_phone ON customers(shop_id, phone);

-- Customer list page (sorted, paginated)
CREATE INDEX idx_customers_shop_last_contact ON customers(shop_id, last_contact_date DESC NULLS LAST);

-- Segmentation queries
CREATE INDEX idx_customers_shop_ltv ON customers(shop_id, lifetime_value DESC);
CREATE INDEX idx_customers_shop_orders ON customers(shop_id, total_orders DESC);
CREATE INDEX idx_customers_loyalty ON customers(shop_id, loyalty_tier, loyalty_points DESC);

-- Tag-based filtering
CREATE INDEX idx_customers_tags ON customers USING gin(tags);

-- Full-text search on customer names and phone
CREATE INDEX idx_customers_search ON customers USING gin(
  to_tsvector('english', 
    coalesce(first_name, '') || ' ' || 
    coalesce(last_name, '') || ' ' || 
    coalesce(phone, '')
  )
);

-- =============================================
-- INDEXES: calls
-- =============================================
-- Dashboard call list (most common query: recent calls for a shop)
CREATE INDEX idx_calls_shop_started ON calls(shop_id, started_at DESC);

-- Customer call history (profile page)
CREATE INDEX idx_calls_customer ON calls(customer_id, started_at DESC) WHERE customer_id IS NOT NULL;

-- Active calls (live call dashboard)
CREATE INDEX idx_calls_active ON calls(shop_id, status) WHERE status IN ('ringing', 'active');

-- Vonage call ID lookup (webhook processing)
CREATE INDEX idx_calls_vonage ON calls(vonage_call_id) WHERE vonage_call_id IS NOT NULL;

-- Calls needing follow-up
CREATE INDEX idx_calls_follow_up ON calls(shop_id, follow_up_needed, started_at DESC) WHERE follow_up_needed = TRUE;

-- Sentiment analysis queries
CREATE INDEX idx_calls_sentiment ON calls(shop_id, sentiment, started_at DESC) WHERE sentiment IS NOT NULL;

-- =============================================
-- INDEXES: orders
-- =============================================
-- Order list (sorted by delivery date)
CREATE INDEX idx_orders_shop_delivery ON orders(shop_id, delivery_date DESC NULLS LAST);

-- Customer order history
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);

-- Orders linked to calls
CREATE INDEX idx_orders_call ON orders(call_id) WHERE call_id IS NOT NULL;

-- Order status filtering
CREATE INDEX idx_orders_status ON orders(shop_id, status, delivery_date);

-- =============================================
-- INDEXES: reminders
-- =============================================
-- Critical: Reminders due today (cron job queries this daily)
CREATE INDEX idx_reminders_due ON reminders(shop_id, reminder_date, status) 
  WHERE status = 'pending';

-- Customer reminders (profile page)
CREATE INDEX idx_reminders_customer ON reminders(customer_id, reminder_date DESC);

-- Recurring reminders
CREATE INDEX idx_reminders_recurring ON reminders(shop_id, recurring, recurrence_pattern) 
  WHERE recurring = TRUE;

-- =============================================
-- INDEXES: notes
-- =============================================
-- Customer notes (profile page)
CREATE INDEX idx_notes_customer ON notes(customer_id, created_at DESC);

-- Pinned notes (shown first)
CREATE INDEX idx_notes_pinned ON notes(customer_id, pinned, created_at DESC) WHERE pinned = TRUE;

-- Notes by call
CREATE INDEX idx_notes_call ON notes(call_id) WHERE call_id IS NOT NULL;

-- =============================================
-- INDEXES: tasks
-- =============================================
-- Open tasks for shop
CREATE INDEX idx_tasks_shop_open ON tasks(shop_id, status, due_date) WHERE status IN ('open', 'in_progress');

-- Customer tasks
CREATE INDEX idx_tasks_customer ON tasks(customer_id, status, due_date) WHERE customer_id IS NOT NULL;

-- Tasks by priority
CREATE INDEX idx_tasks_priority ON tasks(shop_id, priority, due_date) WHERE status != 'done';

-- Assigned tasks
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status, due_date) WHERE assigned_to IS NOT NULL;

-- =============================================
-- INDEXES: loyalty_transactions
-- =============================================
-- Customer loyalty history
CREATE INDEX idx_loyalty_customer ON loyalty_transactions(customer_id, created_at DESC);

-- Transactions by order
CREATE INDEX idx_loyalty_order ON loyalty_transactions(order_id) WHERE order_id IS NOT NULL;

-- =============================================
-- INDEXES: campaigns
-- =============================================
-- Campaign list (sorted by recent)
CREATE INDEX idx_campaigns_shop ON campaigns(shop_id, created_at DESC);

-- Scheduled campaigns (cron job)
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at) 
  WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;

-- =============================================
-- INDEXES: integrations
-- =============================================
-- Active integrations per shop
CREATE INDEX idx_integrations_shop ON integrations(shop_id, status);

-- Integration by provider
CREATE INDEX idx_integrations_provider ON integrations(shop_id, provider);

-- =============================================
-- INDEXES: webhook_endpoints
-- =============================================
-- Active webhooks per shop
CREATE INDEX idx_webhooks_shop ON webhook_endpoints(shop_id, active) WHERE active = TRUE;

-- =============================================
-- INDEXES: webhook_deliveries
-- =============================================
-- Deliveries per endpoint (sorted by recent)
CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(webhook_endpoint_id, created_at DESC);

-- Failed deliveries (for retry logic)
CREATE INDEX idx_webhook_deliveries_failed ON webhook_deliveries(webhook_endpoint_id, attempts, delivered_at) 
  WHERE delivered_at IS NULL;
