import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Application, Job, JobMatch, Profile, WorkerMatch } from "@/lib/types";

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });

export const isAdminQuery = (userId: string) =>
  queryOptions({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

export const jobsListQuery = () =>
  queryOptions({
    queryKey: ["jobs", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, profiles:client_id ( id, full_name, city )")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as unknown as Job[]) ?? [];
    },
  });

export interface JobDetailData {
  job: Job | null;
  applied: boolean;
  applications: Application[];
  matches: WorkerMatch[];
}

export const jobDetailQuery = (jobId: string, profile: Profile | null) =>
  queryOptions({
    queryKey: ["jobs", "detail", jobId, profile?.id ?? null, profile?.role ?? null],
    queryFn: async (): Promise<JobDetailData> => {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*, profiles:client_id ( id, full_name, city )")
        .eq("id", jobId)
        .maybeSingle();
      if (jobError || !jobData) return { job: null, applied: false, applications: [], matches: [] };
      const job = jobData as unknown as Job;
      let applied = false;
      let applications: Application[] = [];
      let matches: WorkerMatch[] = [];
      if (profile?.role === "worker") {
        const { data: existing } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", jobId)
          .eq("worker_id", profile.id)
          .maybeSingle();
        applied = !!existing;
      }
      if (job.client_id === profile?.id) {
        const { data: apps } = await supabase
          .from("applications")
          .select("*, profiles:worker_id ( id, full_name, city, skills, hourly_rate )")
          .eq("job_id", jobId)
          .order("match_score", { ascending: false });
        applications = (apps as unknown as Application[]) ?? [];
      } else {
        const { data: matchData, error: matchError } = await supabase.rpc(
          "rpc_match_workers_for_job",
          { p_job_id: jobId },
        );
        if (!matchError) matches = (matchData as WorkerMatch[]) ?? [];
      }
      return { job, applied, applications, matches };
    },
  });

export interface DashboardData {
  matches: JobMatch[];
  myJobs: Job[];
  incoming: Application[];
  myApplications: Application[];
  error: string | null;
}

export const dashboardQuery = (profile: Profile | null) =>
  queryOptions({
    queryKey: ["dashboard", profile?.id ?? null, profile?.role ?? null],
    queryFn: async (): Promise<DashboardData> => {
      const result: DashboardData = {
        matches: [],
        myJobs: [],
        incoming: [],
        myApplications: [],
        error: null,
      };
      if (!profile) return result;
      if (profile.role === "worker") {
        const [{ data: matchData, error: matchError }, { data: apps, error: appsError }] =
          await Promise.all([
            supabase.rpc("rpc_match_jobs_for_worker", { p_worker_id: profile.id }),
            supabase
              .from("applications")
              .select("*, jobs ( id, title, city, budget, status, category )")
              .eq("worker_id", profile.id)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);
        if (matchError) result.error = matchError.message;
        else result.matches = (matchData as JobMatch[]) ?? [];
        if (appsError) result.error = appsError.message;
        else result.myApplications = (apps as unknown as Application[]) ?? [];
      } else {
        const [{ data: jobs, error: jobsError }, { data: apps, error: appsError }] =
          await Promise.all([
            supabase
              .from("jobs")
              .select("*, profiles:client_id ( id, full_name, city )")
              .eq("client_id", profile.id)
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("applications")
              .select(
                "*, jobs!inner ( id, title, city, budget, status, client_id ), profiles:worker_id ( id, full_name )",
              )
              .eq("jobs.client_id", profile.id)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);
        if (jobsError) result.error = jobsError.message;
        else result.myJobs = (jobs as unknown as Job[]) ?? [];
        if (appsError) result.error = appsError.message;
        else result.incoming = (apps as unknown as Application[]) ?? [];
      }
      return result;
    },
  });
