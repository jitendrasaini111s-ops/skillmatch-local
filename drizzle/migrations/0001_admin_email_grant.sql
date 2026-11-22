CREATE TABLE public.admin_emails (
  email text PRIMARY KEY CHECK (email = lower(email))
);
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_emails (email) VALUES ('jitendrasaini.work@gmail.com');

CREATE OR REPLACE FUNCTION public.grant_admin_on_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_emails a WHERE a.email = lower(NEW.email)) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_admin_on_confirm() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_admin_grant
AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_on_confirm();

-- Backfill any already-confirmed account with a listed email
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
JOIN public.admin_emails a ON a.email = lower(u.email)
WHERE u.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;