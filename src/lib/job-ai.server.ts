// Job-description analysis (ported from the Bolt "extract-job-info" edge function).
export const JOB_CATEGORIES = ["Tutoring", "Design", "Repairs", "Event Help", "Photo Editing", "Other"];
export const JOB_URGENCIES = ["low", "medium", "high"];

export interface ExtractedJobInfo {
  category: string;
  required_skills: string[];
  urgency: string;
  estimated_hours: number | null;
}

export function buildPrompt(title: string, description: string, city: string): string {
  return `Analyze this small job posting and return ONLY a JSON object, no markdown fences, no extra text.

Category must be exactly one of: ${JOB_CATEGORIES.join(", ")}.
urgency must be exactly one of: ${JOB_URGENCIES.join(", ")} (based on deadline, phrasing, and how time-sensitive the task is).
required_skills must be 2-5 short lowercase skill tags (e.g. "math", "photo editing", "ikea assembly").
estimated_hours is a number of hours the task will likely take (may be fractional).

Job title: ${title}
City: ${city || "not specified"}
Description:
${description}

JSON shape:
{"category": string, "required_skills": string[], "urgency": string, "estimated_hours": number}`;
}

export function parseModelJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function validateExtraction(raw: Record<string, unknown>): ExtractedJobInfo {
  const categoryRaw = typeof raw["category"] === "string" ? raw["category"].trim() : "";
  const category =
    JOB_CATEGORIES.find((c) => c.toLowerCase() === categoryRaw.toLowerCase()) ?? "Other";
  const skillsRaw = raw["required_skills"];
  const required_skills = Array.isArray(skillsRaw)
    ? skillsRaw
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5)
    : [];
  const urgencyRaw =
    typeof raw["urgency"] === "string" ? raw["urgency"].trim().toLowerCase() : "";
  const urgency = JOB_URGENCIES.find((u) => u === urgencyRaw) ?? "medium";
  const hoursValue = raw["estimated_hours"];
  const hoursRaw = typeof hoursValue === "number" ? hoursValue : Number(hoursValue);
  const estimated_hours =
    Number.isFinite(hoursRaw) && hoursRaw >= 0 ? Math.min(hoursRaw, 500) : null;
  return { category, required_skills, urgency, estimated_hours };
}

/** Calls the Gemini API directly with the project's own key (the provider the Bolt app used). */
async function callGeminiDirect(prompt: string, apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );
  if (!res.ok) {
    console.error("Gemini API error:", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? null;
}

/** Fallback when no Gemini key is set: a Gemini model through Lovable AI. */
async function callLovableGemini(prompt: string, apiKey: string): Promise<string | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    console.error("Lovable AI error:", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? null;
}

export type ExtractResult = { ok: true; info: ExtractedJobInfo } | { ok: false; error: string };

export async function extractJobInfo(
  title: string,
  description: string,
  city: string,
): Promise<ExtractResult> {
  const prompt = buildPrompt(title, description, city);
  const geminiKey = process.env["GEMINI_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  let text: string | null = null;
  if (geminiKey) text = await callGeminiDirect(prompt, geminiKey);
  else if (lovableKey) text = await callLovableGemini(prompt, lovableKey);
  else
    return { ok: false, error: "The AI service is not configured yet. Please try again later." };

  if (!text) {
    return {
      ok: false,
      error:
        "The AI service could not analyze this job right now. You can still publish it and edit the details.",
    };
  }
  const parsed = parseModelJson(text);
  if (!parsed) {
    return { ok: false, error: "The AI response could not be read. You can still publish the job." };
  }
  return { ok: true, info: validateExtraction(parsed) };
}
