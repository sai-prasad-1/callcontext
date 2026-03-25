-- =============================================
-- Customer Segments Table
-- =============================================
-- Enables shops to create and manage customer segments
-- with flexible filtering and preset templates

CREATE TABLE IF NOT EXISTS public.segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filter JSONB NOT NULL,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_segments_shop ON public.segments(shop_id);
CREATE INDEX idx_segments_preset ON public.segments(is_preset);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read segments in their shop"
  ON public.segments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = segments.shop_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage segments in their shop"
  ON public.segments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = segments.shop_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = segments.shop_id
      AND user_id = auth.uid()
    )
  );

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON public.segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed 6 preset segments for each shop
INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'VIP Customers', 'High-value customers with gold or platinum loyalty tier', 
  '{"loyalty_tier": ["gold", "platinum"]}'::jsonb, true
FROM public.shops s;

INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'Recent Customers', 'Customers who made contact in the last 30 days', 
  '{"last_contact_days": 30}'::jsonb, true
FROM public.shops s;

INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'Inactive Customers', 'Customers with no contact in 90+ days', 
  '{"last_contact_days_min": 90}'::jsonb, true
FROM public.shops s;

INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'Big Spenders', 'Customers with lifetime value over $500', 
  '{"lifetime_value_min": 500}'::jsonb, true
FROM public.shops s;

INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'New Customers', 'Customers added in the last 7 days', 
  '{"created_days": 7}'::jsonb, true
FROM public.shops s;

INSERT INTO public.segments (shop_id, name, description, filter, is_preset)
SELECT s.id, 'Frequent Callers', 'Customers with 5+ calls', 
  '{"total_calls_min": 5}'::jsonb, true
FROM public.shops s;
