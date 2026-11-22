import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extractJobInfo } from "@/lib/job-ai.server";

const inputSchema = z.object({
  title: z.string().max(200).default(""),
  description: z.string().min(1).max(5000),
  city: z.string().max(100).default(""),
});

/** Reads a job description with AI and suggests category, skills, urgency and hours. */
export const analyzeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      return await extractJobInfo(data.title, data.description, data.city);
    } catch (err) {
      console.error("analyzeJob error:", err);
      return {
        ok: false as const,
        error: "Something went wrong while analyzing the job. You can still publish it.",
      };
    }
  });
