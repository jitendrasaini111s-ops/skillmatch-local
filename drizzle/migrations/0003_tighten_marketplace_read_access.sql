-- Helper checks run with elevated rights so policies on jobs/applications/profiles don't recurse.
CREATE OR REPLACE FUNCTION public.has_applied_to_job(_job_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.job_id = _job_id AND a.worker_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_visible_client(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.client_id = _profile_id
      AND (
        j.status = 'open'
        OR EXISTS (
          SELECT 1 FROM public.applications a
          WHERE a.job_id = j.id AND a.worker_id = auth.uid()
        )
      )
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_applied_to_job(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_visible_client(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_applied_to_job(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_visible_client(uuid) TO authenticated;

-- Jobs: open jobs are listed for everyone signed in; filled jobs only for the owner, applicants and admins.
DROP POLICY IF EXISTS "Signed-in users can view jobs" ON public.jobs;
CREATE POLICY "Users can view open, own or applied jobs" ON public.jobs
  FOR SELECT TO authenticated
  USING (
    status = 'open'
    OR auth.uid() = client_id
    OR public.has_applied_to_job(id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- Profiles: own profile, worker listings, clients with open jobs or jobs you applied to, and admins.
DROP POLICY IF EXISTS "Signed-in users can view profiles" ON public.profiles;
CREATE POLICY "Users can view own, worker and relevant client profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR role = 'worker'
    OR public.is_visible_client(id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- Reviews: worker reputation is visible; other reviews only to their author, subject and admins.
DROP POLICY IF EXISTS "Signed-in users can view reviews" ON public.reviews;
CREATE POLICY "Users can view worker reviews and their own" ON public.reviews
  FOR SELECT TO authenticated
  USING (
    auth.uid() = author_id
    OR auth.uid() = worker_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reviews.worker_id AND p.role = 'worker'
    )
  );