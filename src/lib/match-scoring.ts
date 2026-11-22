// Pure scoring rules for "Find best workers" (shared by the server and the UI).

/** Final match % = 0.5 AI + 0.2 skills + 0.15 city + 0.1 price + 0.05 rating. */
export const MATCH_WEIGHTS = {
  ai: 0.5,
  skills: 0.2,
  city: 0.15,
  price: 0.1,
  rating: 0.05,
} as const;

export type MatchComponentKey = keyof typeof MATCH_WEIGHTS;
export type MatchComponents = Record<MatchComponentKey, number>;

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const norm = (s: string) => s.trim().toLowerCase();

/** Jaccard similarity of job skills and worker skills, scaled to 0-100. */
export function skillOverlap(jobSkills: string[], workerSkills: string[]): number {
  const a = new Set(jobSkills.map(norm).filter(Boolean));
  const b = new Set(workerSkills.map(norm).filter(Boolean));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  let shared = 0;
  for (const s of a) if (b.has(s)) shared++;
  return (shared / union.size) * 100;
}

/** 100 when the worker is in the same city as the job, otherwise 0. */
export function cityBonus(jobCity: string, workerCity: string): number {
  const a = norm(jobCity ?? "");
  const b = norm(workerCity ?? "");
  return a !== "" && a === b ? 100 : 0;
}

/** Worker's expected cost: hourly rate × estimated hours (or one hour when unknown). */
export function estimatedCost(rate: number | null, hours: number | null): number | null {
  if (rate == null) return null;
  return rate * (hours != null && hours > 0 ? hours : 1);
}

/**
 * 100 when the worker's expected cost is within the job budget, dropping linearly
 * to 0 at double the budget. Unknown rate or budget scores a neutral 50.
 */
export function priceFit(rate: number | null, budget: number, hours: number | null): number {
  const cost = estimatedCost(rate, hours);
  if (cost == null || !(budget > 0)) return 50;
  if (cost <= budget) return 100;
  return clamp(100 * (1 - (cost - budget) / budget));
}

/** Average star rating (0-5) scaled to 0-100; workers without reviews score 0. */
export function ratingScore(avgRating: number | null): number {
  if (avgRating == null) return 0;
  return clamp(avgRating, 0, 5) * 20;
}

/** Weighted final match percentage, rounded to a whole number. */
export function finalMatch(c: MatchComponents): number {
  const total =
    MATCH_WEIGHTS.ai * clamp(c.ai) +
    MATCH_WEIGHTS.skills * clamp(c.skills) +
    MATCH_WEIGHTS.city * clamp(c.city) +
    MATCH_WEIGHTS.price * clamp(c.price) +
    MATCH_WEIGHTS.rating * clamp(c.rating);
  return Math.round(clamp(total));
}

// ---------- Keyword-only comparison ranking ----------

const STOPWORDS = new Set(
  (
    "the and for with that this from have has will need needs needed our your you are was were " +
    "can could would should into onto about over under some any all who what when where which " +
    "please looking help job work want also just like make more most very each per get got its " +
    "them they their there here than then been being but not out off one two three week weeks day " +
    "days hour hours time small local someone anyone able must around near via"
  ).split(" "),
);

/** Lowercase keywords (3+ letters, no common filler words, simple plural folding). */
export function extractKeywords(text: string): string[] {
  const out = new Set<string>();
  for (const raw of (text ?? "").toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 3 || STOPWORDS.has(raw) || /^\d+$/.test(raw)) continue;
    const word = raw.length > 4 && raw.endsWith("s") && !raw.endsWith("ss") ? raw.slice(0, -1) : raw;
    out.add(word);
  }
  return [...out];
}

export interface KeywordCandidate {
  id: string;
  full_name: string;
  skills: string[];
  bio: string;
}

export interface KeywordScore {
  worker_id: string;
  score: number;
  matched: string[];
}

/** Ranks workers only by how many job-description keywords appear in their skills or bio. */
export function keywordRanking(
  description: string,
  workers: KeywordCandidate[],
  limit = 10,
): KeywordScore[] {
  const jobKeywords = extractKeywords(description);
  if (jobKeywords.length === 0) return [];
  return workers
    .map((w) => {
      const words = new Set(extractKeywords(`${w.skills.join(" ")} ${w.bio}`));
      const matched = jobKeywords.filter((k) => words.has(k));
      return {
        worker_id: w.id,
        name: w.full_name,
        score: Math.round((matched.length / jobKeywords.length) * 100),
        matched,
      };
    })
    .filter((r) => r.matched.length > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ worker_id, score, matched }) => ({ worker_id, score, matched }));
}
