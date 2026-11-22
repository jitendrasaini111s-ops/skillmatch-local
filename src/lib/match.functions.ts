import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rankWorkersWithAi, type AiCandidate } from "@/lib/match-ai.server";
import { extractJobInfo } from "@/lib/job-ai.server";
import {
  cityBonus,
  estimatedCost,
  extractKeywords,
  finalMatch,
  keywordRanking,
  priceFit,
  ratingScore,
  skillOverlap,
  type MatchComponents,
} from "@/lib/match-scoring";

const MAX_CANDIDATES = 40;

export interface MatchedWorker {
  worker_id: string;
  full_name: string;
  city: string;
  hourly_rate: number | null;
  skills: string[];
  rating: number | null;
  review_count: number;
}

export interface AiWorkerMatch extends MatchedWorker {
  match: number;
  components: MatchComponents;
  reason: string;
  estimated_cost: number | null;
}

export interface KeywordWorkerMatch extends MatchedWorker {
  score: number;
  matched: string[];
}

export interface FilledJobInfo {
  category: string;
  required_skills: string[];
  urgency: string;
  estimated_hours: number | null;
}

export type FindBestWorkersResult =
  | {
      ok: true;
      matches: AiWorkerMatch[];
      keyword: KeywordWorkerMatch[];
      candidateCount: number;
      jobKeywordCount: number;
      /** AI job details that were missing and have now been saved on the job. */
      filledInfo: FilledJobInfo | null;
    }
  | { ok: false; error: string };

interface WorkerRow {
  id: string;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: number | null;
  city: string;
}

/** AI-ranked top 10 workers for a job, plus a keyword-only ranking for comparison. */
export const findBestWorkers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<FindBestWorkersResult> => {
    try {
      const sb = context.supabase;
      const { data: job, error: jobError } = await sb
        .from("jobs")
        .select("id, client_id, title, description, category, city, budget, required_skills, urgency, estimated_hours")
        .eq("id", data.jobId)
        .maybeSingle();
      if (jobError || !job) return { ok: false, error: "We couldn't find this job." };

      if (job.client_id !== context.userId) {
        const { data: isAdmin } = await sb.rpc("has_role", {
          _user_id: context.userId,
          _role: "admin",
        });
        if (!isAdmin) {
          return { ok: false, error: "Only the person who posted this job can find workers for it." };
        }
      }

      const { data: workerData, error: workersError } = await sb
        .from("profiles")
        .select("id, full_name, bio, skills, hourly_rate, city")
        .eq("role", "worker")
        .neq("full_name", "")
        .limit(1000);
      if (workersError) {
        return { ok: false, error: "We couldn't load workers right now. Please try again." };
      }
      const workers = (workerData ?? []) as WorkerRow[];
      if (workers.length === 0) {
        return { ok: false, error: "There are no workers signed up yet, so there's no one to match." };
      }

      let jobSkills: string[] = job.required_skills ?? [];
      const budget = Number(job.budget);
      let hours = job.estimated_hours != null ? Number(job.estimated_hours) : null;
      let filledInfo: FilledJobInfo | null = null;

      // Jobs added without the AI step (e.g. sample data) have no skills or hours yet:
      // run the same AI job analysis now and save it, so skill overlap and price fit work.
      if (jobSkills.length === 0) {
        const extracted = await extractJobInfo(job.title, job.description, job.city);
        if (extracted.ok) {
          const info: FilledJobInfo = {
            category: job.category && job.category !== "Other" ? job.category : extracted.info.category,
            required_skills: extracted.info.required_skills,
            urgency: job.urgency || extracted.info.urgency,
            estimated_hours: hours ?? extracted.info.estimated_hours,
          };
          jobSkills = info.required_skills;
          hours = info.estimated_hours;
          const { data: saved } = await sb.from("jobs").update(info).eq("id", job.id).select("id");
          if (saved && saved.length > 0) filledInfo = info;
        }
      }
      const jobKeywords = new Set(extractKeywords(`${job.title} ${job.description}`));

      // Shortlist the most plausible workers so the AI gets a focused list.
      const prescore = (w: WorkerRow) => {
        const words = extractKeywords(`${w.skills.join(" ")} ${w.bio}`);
        const kw = jobKeywords.size ? words.filter((k) => jobKeywords.has(k)).length * 10 : 0;
        return (
          skillOverlap(jobSkills, w.skills) +
          Math.min(kw, 60) +
          cityBonus(job.city, w.city) * 0.5 +
          priceFit(w.hourly_rate, budget, hours) * 0.25
        );
      };
      const shortlist = [...workers]
        .map((w) => ({ w, s: prescore(w) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, MAX_CANDIDATES)
        .map((x) => x.w);

      const keywordScores = keywordRanking(job.description, workers, 10);

      // Ratings for every worker we might show.
      const ids = [...new Set([...shortlist.map((w) => w.id), ...keywordScores.map((k) => k.worker_id)])];
      const { data: reviewRows } = await sb.from("reviews").select("worker_id, rating").in("worker_id", ids);
      const ratingMap = new Map<string, { sum: number; count: number }>();
      for (const r of reviewRows ?? []) {
        const cur = ratingMap.get(r.worker_id) ?? { sum: 0, count: 0 };
        cur.sum += Number(r.rating);
        cur.count += 1;
        ratingMap.set(r.worker_id, cur);
      }
      const byId = new Map(workers.map((w) => [w.id, w]));
      const info = (w: WorkerRow): MatchedWorker => {
        const r = ratingMap.get(w.id);
        return {
          worker_id: w.id,
          full_name: w.full_name,
          city: w.city,
          hourly_rate: w.hourly_rate != null ? Number(w.hourly_rate) : null,
          skills: w.skills ?? [],
          rating: r ? Math.round((r.sum / r.count) * 10) / 10 : null,
          review_count: r?.count ?? 0,
        };
      };

      const keyword: KeywordWorkerMatch[] = keywordScores.flatMap((k) => {
        const w = byId.get(k.worker_id);
        return w ? [{ ...info(w), score: k.score, matched: k.matched }] : [];
      });

      const candidates: AiCandidate[] = shortlist.map((w, i) => {
        const base = info(w);
        return {
          ref: `w${i + 1}`,
          skills: base.skills,
          city: base.city,
          hourly_rate: base.hourly_rate,
          rating: base.rating,
          review_count: base.review_count,
          bio: w.bio ?? "",
        };
      });
      const refToWorker = new Map(candidates.map((c, i) => [c.ref, shortlist[i]!]));

      const ai = await rankWorkersWithAi(
        {
          title: job.title,
          description: job.description,
          category: job.category,
          required_skills: jobSkills,
          city: job.city,
          budget,
          estimated_hours: hours,
        },
        candidates,
      );
      if (!ai.ok) return { ok: false, error: ai.error };

      const matches: AiWorkerMatch[] = ai.ranked
        .flatMap((r) => {
          const w = refToWorker.get(r.ref);
          if (!w) return [];
          const base = info(w);
          const components: MatchComponents = {
            ai: r.ai_score,
            skills: skillOverlap(jobSkills, base.skills),
            city: cityBonus(job.city, base.city),
            price: priceFit(base.hourly_rate, budget, hours),
            rating: ratingScore(base.rating),
          };
          return [
            {
              ...base,
              match: finalMatch(components),
              components,
              reason: r.reason,
              estimated_cost: estimatedCost(base.hourly_rate, hours),
            },
          ];
        })
        .sort((a, b) => b.match - a.match);

      return {
        ok: true,
        matches,
        keyword,
        candidateCount: candidates.length,
        jobKeywordCount: extractKeywords(job.description).length,
        filledInfo,
      };
    } catch (err) {
      console.error("findBestWorkers error:", err);
      return { ok: false, error: "Something went wrong while finding the best workers. Please try again." };
    }
  });
