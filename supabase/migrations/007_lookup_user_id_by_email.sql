-- Service-role only: resolve auth user id by email for team invite API.
-- Not granted to anon/authenticated.

CREATE OR REPLACE FUNCTION public.lookup_user_id_by_email(lookup_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(lookup_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_user_id_by_email(TEXT) TO service_role;
