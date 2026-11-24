ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS experience_level text NOT NULL DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS professional_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT '';