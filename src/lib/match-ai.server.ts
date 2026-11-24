// Server-only: asks Lovable AI to rank candidate workers for a job.
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, jsonSchema, streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway/run-id.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export interface AiJobInput {
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  city: string;
  budget: number;
  estimated_hours: number | null;
  experience_level?: string;
  project_type?: string;
}

export interface AiCandidate {
  ref: string;
  skills: string[];
  city: string;
  hourly_rate: number | null;
  rating: number | null;
  review_count: number;
  bio: string;
  title?: string;
  experience_years?: number | null;
}

export interface AiRanked {
  ref: string;
  ai_score: number;
  reason: string;
}

export type AiRankResult = { ok: true; ranked: AiRanked[] } | { ok: false; error: string };

type AiOutput = { matches: { worker_ref: string; ai_score: number; reason: string }[] };

const outputSchema = jsonSchema<AiOutput>({
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          worker_ref: { type: "string" },
          ai_score: { type: "number" },
          reason: { type: "string" },
        },
        required: ["worker_ref", "ai_score", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["matches"],
  additionalProperties: false,
});

const INSTRUCTIONS = `You match freelancers to a freelance project posted on an Indian freelance marketplace (web development, design, writing, video, marketing, data, AI, apps, creative media).
Judge every candidate on how well they fit THIS project: required technical skills versus their skills, their professional title and years of experience versus the requested experience level, relevance to the project category and requirements, hourly rate in Indian Rupees (INR) versus the project budget, rating, and (minor) location. Most work is remote.
Return the 10 best candidates (fewer only if there are fewer than 10), best first.
For each one give:
- worker_ref: copied exactly from the candidate list
- ai_score: an integer from 0 to 100 (100 = ideal fit)
- reason: ONE short sentence (max 25 words) written to the job poster explaining the fit.
Never invent workers or refs.`;

function safeGatewayMessage(err: APICallError): string | null {
  try {
    const body = JSON.parse(err.responseBody ?? "") as { message?: unknown; error?: { message?: unknown } };
    const msg = typeof body.message === "string" ? body.message : body.error?.message;
    return typeof msg === "string" && msg.length < 300 ? msg : null;
  } catch {
    return null;
  }
}

function friendlyError(err: unknown): string {
  if (NoObjectGeneratedError.isInstance(err)) {
    return "The AI gave an answer we couldn't read. Please try again.";
  }
  if (APICallError.isInstance(err)) {
    const status = err.statusCode ?? 0;
    if (status === 402) {
      return (
        safeGatewayMessage(err) ??
        "AI matching is paused because the AI credits have run out. Please try again later."
      );
    }
    if (status === 429) {
      return "AI matching is busy right now. Please wait a minute and try again.";
    }
    if (status === 403) {
      return safeGatewayMessage(err) ?? "AI matching isn't available for this app right now.";
    }
    if (status >= 500) {
      return "The AI service is having trouble right now. Please try again in a moment.";
    }
  }
  return "Something went wrong while finding the best workers. Please try again.";
}

export async function rankWorkersWithAi(
  job: AiJobInput,
  candidates: AiCandidate[],
): Promise<AiRankResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "AI matching is not set up yet. Please try again later." };

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const payload = {
    job: {
      title: job.title,
      description: job.description.slice(0, 1500),
      category: job.category,
      required_skills: job.required_skills,
      city: job.city || "not specified",
      budget_inr_total: job.budget,
      experience_level: job.experience_level ?? "any",
      project_type: job.project_type ?? "fixed",
      estimated_hours: job.estimated_hours,
    },
    candidates: candidates.map((c) => ({
      worker_ref: c.ref,
      skills: c.skills,
      city: c.city,
      hourly_rate_inr: c.hourly_rate,
      professional_title: c.title ?? "",
      experience_years: c.experience_years ?? null,
      rating_out_of_5: c.rating,
      review_count: c.review_count,
      bio: c.bio.slice(0, 300),
    })),
  };

  let streamError: unknown = null;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
      output: Output.object({ schema: outputSchema }),
      maxRetries: 1,
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const output = await result.output;
    const valid = new Set(candidates.map((c) => c.ref));
    const seen = new Set<string>();
    const ranked: AiRanked[] = [];
    for (const m of output?.matches ?? []) {
      const ref = String(m.worker_ref ?? "").trim();
      if (!valid.has(ref) || seen.has(ref)) continue;
      seen.add(ref);
      const score = Number(m.ai_score);
      ranked.push({
        ref,
        ai_score: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0,
        reason: String(m.reason ?? "").trim().slice(0, 280),
      });
      if (ranked.length === 10) break;
    }
    if (ranked.length === 0) {
      return { ok: false, error: "The AI couldn't pick any workers for this job. Please try again." };
    }
    return { ok: true, ranked };
  } catch (err) {
    console.error("rankWorkersWithAi error:", streamError ?? err);
    return { ok: false, error: friendlyError(streamError ?? err) };
  }
}
