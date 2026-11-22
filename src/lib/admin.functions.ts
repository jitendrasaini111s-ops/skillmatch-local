import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildSeedRows, SEED_CATEGORIES } from "@/lib/seed-data";

/** Admin-only: adds 40 demo worker profiles and 100 demo jobs (owned by the admin). */
export const seedSampleData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      throw new Error("Only admins can seed sample data.");
    }

    const { workerRows, jobRows } = buildSeedRows();

    // Demo workers have no sign-in account, so they can only be written with elevated access.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: workersError } = await supabaseAdmin
      .from("profiles")
      .upsert(workerRows, { onConflict: "id", ignoreDuplicates: true });
    if (workersError) throw new Error(workersError.message);

    // Jobs are inserted as the admin, so normal access rules apply.
    const { error: jobsError } = await context.supabase.from("jobs").insert(jobRows);
    if (jobsError) throw new Error(jobsError.message);

    return {
      message: `Added 40 sample workers and 100 sample jobs across ${SEED_CATEGORIES.length} categories.`,
    };
  });
