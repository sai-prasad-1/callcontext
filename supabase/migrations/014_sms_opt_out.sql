-- Add SMS opt-out tracking for TCPA compliance
-- Required by US law: customers must be able to opt out of SMS

ALTER TABLE public.customers
ADD COLUMN sms_opted_out BOOLEAN DEFAULT false,
ADD COLUMN sms_opted_out_at TIMESTAMPTZ,
ADD COLUMN sms_opt_out_reason TEXT;

CREATE INDEX idx_customers_sms_opted_out ON public.customers(sms_opted_out);

COMMENT ON COLUMN public.customers.sms_opted_out IS 'Whether customer has opted out of SMS messages';
COMMENT ON COLUMN public.customers.sms_opted_out_at IS 'When customer opted out';
COMMENT ON COLUMN public.customers.sms_opt_out_reason IS 'Reason for opt-out (STOP keyword, web form, etc)';

-- Create SMS opt-out log table for compliance records
CREATE TABLE IF NOT EXISTS public.sms_opt_outs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  method TEXT NOT NULL, -- 'STOP', 'WEB', 'MANUAL'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_opt_outs_shop ON public.sms_opt_outs(shop_id);
CREATE INDEX idx_sms_opt_outs_customer ON public.sms_opt_outs(customer_id);
CREATE INDEX idx_sms_opt_outs_phone ON public.sms_opt_outs(phone);

ALTER TABLE public.sms_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read opt_outs in their shop"
  ON public.sms_opt_outs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = sms_opt_outs.shop_id
      AND user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.sms_opt_outs IS 'Compliance log for SMS opt-outs (TCPA requirement)';
