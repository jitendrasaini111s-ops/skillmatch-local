-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'worker')),
  full_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  city text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.profiles TO authenticated;
GRANT UPDATE (full_name, bio, skills, hourly_rate, city, avatar_url, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============ jobs ============
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  budget numeric NOT NULL CHECK (budget >= 0),
  city text NOT NULL DEFAULT '',
  deadline date,
  category text NOT NULL DEFAULT 'Other',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled')),
  required_skills text[] NOT NULL DEFAULT '{}',
  urgency text NOT NULL DEFAULT '',
  estimated_hours numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jobs_city_idx ON public.jobs (city);
CREATE INDEX jobs_status_idx ON public.jobs (status);
CREATE INDEX jobs_category_idx ON public.jobs (category);
CREATE INDEX jobs_client_idx ON public.jobs (client_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view jobs" ON public.jobs
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients can insert own jobs" ON public.jobs
FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own jobs" ON public.jobs
FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can delete own jobs" ON public.jobs
FOR DELETE TO authenticated USING (auth.uid() = client_id);

-- ============ applications ============
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  match_score integer NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)
);

CREATE INDEX applications_job_idx ON public.applications (job_id);
CREATE INDEX applications_worker_idx ON public.applications (worker_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers and job owners can view applications" ON public.applications
FOR SELECT TO authenticated USING (
  auth.uid() = worker_id
  OR EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid())
);
CREATE POLICY "Workers can apply to jobs" ON public.applications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Clients update applications on their jobs" ON public.applications
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid()));
CREATE POLICY "Workers can withdraw own applications" ON public.applications
FOR DELETE TO authenticated USING (auth.uid() = worker_id);

-- ============ reviews ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reviews_worker_idx ON public.reviews (worker_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view reviews" ON public.reviews
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can write own reviews" ON public.reviews
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own reviews" ON public.reviews
FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own reviews" ON public.reviews
FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- ============ admin roles ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ============ auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
BEGIN
  IF v_role NOT IN ('client', 'worker') THEN
    v_role := 'client';
  END IF;
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (NEW.id, v_role, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ matching functions ============
CREATE OR REPLACE FUNCTION public.rpc_match_workers_for_job(p_job_id uuid)
RETURNS TABLE (worker_id uuid, full_name text, bio text, skills text[], hourly_rate numeric, city text, match_score integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.bio, p.skills, p.hourly_rate, p.city,
    LEAST(100,
      CASE WHEN p.city = j.city THEN 35 ELSE 5 END
      + LEAST(40, (
        SELECT COUNT(*) * 20 FROM unnest(p.skills) s
        WHERE j.title ILIKE '%' || s || '%' OR j.description ILIKE '%' || s || '%' OR j.category ILIKE '%' || s || '%'
      ))
      + CASE WHEN p.hourly_rate IS NOT NULL AND j.budget > 0 AND p.hourly_rate <= j.budget THEN 20 ELSE 0 END
    )::integer AS match_score
  FROM public.profiles p
  JOIN public.jobs j ON j.id = p_job_id
  WHERE p.role = 'worker' AND p.full_name <> ''
  ORDER BY match_score DESC, p.full_name
  LIMIT 12;
$$;

CREATE OR REPLACE FUNCTION public.rpc_match_jobs_for_worker(p_worker_id uuid)
RETURNS TABLE (job_id uuid, title text, description text, budget numeric, city text, deadline date, category text, status text, created_at timestamptz, match_score integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT j.id, j.title, j.description, j.budget, j.city, j.deadline, j.category, j.status, j.created_at,
    LEAST(100,
      CASE WHEN j.city = w.city THEN 35 ELSE 5 END
      + LEAST(40, (
        SELECT COUNT(*) * 20 FROM unnest(w.skills) s
        WHERE j.title ILIKE '%' || s || '%' OR j.description ILIKE '%' || s || '%' OR j.category ILIKE '%' || s || '%'
      ))
      + CASE WHEN w.hourly_rate IS NOT NULL AND j.budget > 0 AND w.hourly_rate <= j.budget THEN 20 ELSE 0 END
    )::integer AS match_score
  FROM public.jobs j
  JOIN public.profiles w ON w.id = p_worker_id
  WHERE j.status = 'open'
  ORDER BY match_score DESC, j.created_at DESC
  LIMIT 20;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_match_workers_for_job(uuid), public.rpc_match_jobs_for_worker(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_match_workers_for_job(uuid), public.rpc_match_jobs_for_worker(uuid) TO authenticated;