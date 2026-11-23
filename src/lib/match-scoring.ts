// Pure scoring rules for "Find best workers" (shared by the server and the UI).

/**
 * Final match % = 0.5 AI + 0.2 skills + 0.15 location + 0.1 price + 0.05 rating.
 * The "city" key is the location component: distance in km when both PIN codes are known,
 * otherwise the same-city check. Amounts (rate, budget) are Indian rupees.
 */
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

const SKILL_FILLER = new Set(["and", "the", "for", "with", "of", "in", "on"]);

/** Skill tags broken into stemmed words, so "drywall repair" and "drywall" share "drywall". */
function skillWords(skills: string[]): Set<string> {
  const out = new Set<string>();
  for (const tag of skills) {
    for (const w of norm(tag).split(/[^a-z0-9]+/)) {
      if (w.length >= 2 && !SKILL_FILLER.has(w)) out.add(stemWord(w));
    }
  }
  return out;
}

/**
 * Jaccard similarity of job skills and worker skills (compared word by word, with light
 * stemming so "painting" matches "paint"), scaled to 0-100.
 */
export function skillOverlap(jobSkills: string[], workerSkills: string[]): number {
  const a = skillWords(jobSkills);
  const b = skillWords(workerSkills);
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  let shared = 0;
  for (const s of a) if (b.has(s)) shared++;
  return (shared / union.size) * 100;
}

/** Fallback location score: 100 when the worker is in the same city as the job, otherwise 0. */
export function cityBonus(jobCity: string, workerCity: string): number {
  const a = norm(jobCity ?? "");
  const b = norm(workerCity ?? "");
  return a !== "" && a === b ? 100 : 0;
}

// ---------- Distance (PIN code area centres) ----------

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Straight-line distance in km between two points (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Full location score up to this distance. */
export const DISTANCE_FULL_KM = 5;
/** Location score reaches 0 at this distance. */
export const DISTANCE_ZERO_KM = 50;

/** 100 within 5 km, falling linearly to 0 at 50 km (and beyond). */
export function distanceScore(km: number): number {
  if (!(km >= 0)) return 0;
  if (km <= DISTANCE_FULL_KM) return 100;
  return clamp(100 * (1 - (km - DISTANCE_FULL_KM) / (DISTANCE_ZERO_KM - DISTANCE_FULL_KM)));
}

export type LocationBasis = "distance" | "city";

export interface LocationFit {
  score: number;
  basis: LocationBasis;
  /** Approximate km between PIN-area centres; null when either PIN has no known location. */
  distance_km: number | null;
}

/**
 * Location component: distance score when both PIN codes have coordinates, otherwise the
 * same-city fallback. Never invents a distance for PINs without coordinates.
 */
export function locationFit(
  jobPoint: LatLng | null | undefined,
  workerPoint: LatLng | null | undefined,
  jobCity: string,
  workerCity: string,
): LocationFit {
  if (jobPoint && workerPoint) {
    const km = Math.round(haversineKm(jobPoint, workerPoint) * 10) / 10;
    return { score: distanceScore(km), basis: "distance", distance_km: km };
  }
  return { score: cityBonus(jobCity, workerCity), basis: "city", distance_km: null };
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
    "days hour hours time small local someone anyone able must around near via " +
    // Generic marketplace filler that says nothing about the task or the worker's skills.
    "reliable easy message availability available reply quickly quick thanks thank friendly happy " +
    "experience experienced year years specialist travel within city plus great good nice"
  ).split(" "),
);

const SUFFIXES = ["ings", "ing", "ers", "er", "ed", "es", "s", "al", "e"];

/** Light stemming so "serve"/"server", "remove"/"removal" and "paint"/"painting" match. */
export function stemWord(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

function tokenize(text: string): string[] {
  return (text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/** Distinct keyword stems in a text (3+ letters, no common filler words). */
export function extractKeywords(text: string): string[] {
  return [...new Set(tokenize(text).map(stemWord))];
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
  // Map each stem back to the word as written in the description, for display.
  const display = new Map<string, string>();
  for (const w of tokenize(description)) {
    const stem = stemWord(w);
    if (!display.has(stem)) display.set(stem, w);
  }
  const jobStems = [...display.keys()];
  if (jobStems.length === 0) return [];
  return workers
    .map((w) => {
      const words = new Set(extractKeywords(`${w.skills.join(" ")} ${w.bio}`));
      const matchedStems = jobStems.filter((k) => words.has(k));
      return {
        worker_id: w.id,
        name: w.full_name,
        score: Math.round((matchedStems.length / jobStems.length) * 100),
        matched: matchedStems.map((k) => display.get(k) ?? k),
      };
    })
    .filter((r) => r.matched.length > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ worker_id, score, matched }) => ({ worker_id, score, matched }));
}
