-- Add scopes/permissions to API keys
-- Allows fine-grained access control for each API key

ALTER TABLE public.api_keys
ADD COLUMN scopes JSONB DEFAULT '{"customers": "read", "calls": "read", "orders": "read", "notes": "none", "reminders": "none", "tasks": "none", "analytics": "none", "segments": "none", "campaigns": "none", "webhooks": "none"}'::jsonb;

-- Valid scopes per resource:
-- "none" = no access
-- "read" = read only
-- "write" = read + create + update
-- "admin" = read + write + delete

COMMENT ON COLUMN public.api_keys.scopes IS 'Permissions for each resource: none, read, write, admin';

-- Create index for faster scope lookups
CREATE INDEX idx_api_keys_scopes ON public.api_keys USING gin(scopes);
