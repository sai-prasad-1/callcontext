-- API Keys table for REST API authentication
-- Stores hashed API keys for shops to access CallContext REST API

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  total_requests INTEGER DEFAULT 0,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_keys_shop ON public.api_keys(shop_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_revoked ON public.api_keys(revoked);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read api_keys in their shop"
  ON public.api_keys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = api_keys.shop_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage api_keys in their shop"
  ON public.api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = api_keys.shop_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = api_keys.shop_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );
