import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildSeedRows, SEED_CATEGORIES } from "@/lib/seed-data";

/** Admin-only: adds demo freelancers, demo clients and 100 freelance projects (no duplicates). */
export const seedSampleData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Only admins can seed sample data.");

    const { workerRows, clientRows, jobRows } = buildSeedRows();
    // Demo profiles have no sign-in account, so they can only be written with elevated access.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .upsert([...workerRows, ...clientRows], { onConflict: "seed_key", ignoreDuplicates: true });
    if (pErr) throw new Error(pErr.message);

    const { data: clients, error: cErr } = await supabaseAdmin
      .from("profiles")
      .select("id, seed_key")
      .in("seed_key", clientRows.map((c) => c.seed_key));
    if (cErr) throw new Error(cErr.message);
    const idByKey = new Map((clients ?? []).map((c) => [c.seed_key, c.id]));

    const rows = jobRows.map(({ client_seed_key, ...job }) => ({
      ...job,
      client_id: idByKey.get(client_seed_key) ?? context.userId,
    }));
    const { error: jErr } = await supabaseAdmin
      .from("jobs")
      .upsert(rows, { onConflict: "seed_key", ignoreDuplicates: true });
    if (jErr) throw new Error(jErr.message);

    return {
      message: `Added ${workerRows.length} freelancers, ${clientRows.length} clients and ${jobRows.length} projects across ${SEED_CATEGORIES.length} categories.`,
    };
  });
