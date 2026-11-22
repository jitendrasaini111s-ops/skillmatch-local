-- Six-digit Indian PIN code on worker profiles and jobs (optional; existing rows stay empty).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pincode_format CHECK (pincode IS NULL OR pincode ~ '^[1-9][0-9]{5}$');
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_pincode_format CHECK (pincode IS NULL OR pincode ~ '^[1-9][0-9]{5}$');

-- Stable key for sample (seeded) records, so re-running the seed never creates duplicates.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seed_key text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_seed_key_key UNIQUE (seed_key);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS seed_key text;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_seed_key_key UNIQUE (seed_key);

-- Approximate centre of each Indian PIN code area (India Post "All India Pincode Directory",
-- data.gov.in, GODL-India; cleaned per-PIN centroids). Read-only reference data.
CREATE TABLE public.pincode_locations (
  pincode text PRIMARY KEY CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  office_name text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT ''
);
COMMENT ON TABLE public.pincode_locations IS 'Approximate PIN code area centres. Source: Department of Posts, Govt. of India, All India Pincode Directory (data.gov.in, GODL-India), adapted.';

GRANT SELECT ON public.pincode_locations TO authenticated;
GRANT ALL ON public.pincode_locations TO service_role;
ALTER TABLE public.pincode_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can look up PIN codes" ON public.pincode_locations
  FOR SELECT TO authenticated USING (true);