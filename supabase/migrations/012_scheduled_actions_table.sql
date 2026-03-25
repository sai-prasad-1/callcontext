-- =============================================
-- Scheduled Actions Table
-- =============================================
-- Enables automated actions triggered by rules
-- Supports SMS, email, tasks, reminders, and customer updates

CREATE TABLE IF NOT EXISTS public.scheduled_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('send_sms', 'send_email', 'create_task', 'create_reminder', 'update_customer')),
  action_config JSONB NOT NULL,
  execute_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scheduled_actions_shop ON public.scheduled_actions(shop_id);
CREATE INDEX idx_scheduled_actions_execute ON public.scheduled_actions(execute_at, status);
CREATE INDEX idx_scheduled_actions_rule ON public.scheduled_actions(rule_id, shop_id);

ALTER TABLE public.scheduled_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read scheduled_actions in their shop"
  ON public.scheduled_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_memberships
      WHERE shop_id = scheduled_actions.shop_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all scheduled_actions"
  ON public.scheduled_actions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
