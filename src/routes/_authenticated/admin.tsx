import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { seedSampleData } from '@/lib/admin.functions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Spinner } from '@/components/app-ui';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({
    meta: [
      { title: 'Admin — SkillMatch Local' },
      { name: 'description', content: 'Admin tools for populating SkillMatch Local with sample data.' },
      { property: 'og:title', content: 'Admin — SkillMatch Local' },
      { property: 'og:description', content: 'Admin tools for SkillMatch Local.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { isAdmin } = useCurrentUser();
  const queryClient = useQueryClient();
  const runSeed = useServerFn(seedSampleData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seed = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await runSeed();
      setResult(res.message);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Seeding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-warning-ring bg-warning-soft p-8 text-center">
        <h1 className="text-lg font-bold text-warning-deep">Admins only</h1>
        <p className="mt-2 text-sm text-warning-strong">
          This page is only available to SkillMatch Local admins.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Populate the marketplace with demo data so the job list and AI matching have plenty to
          work with.
        </p>
      </div>

      <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Seed sample data</h2>
            <p className="mt-1 text-sm leading-relaxed text-body">
              Inserts <strong>40 sample workers</strong> and <strong>100 sample jobs</strong> across
              tutoring, design, repairs, event help, and photo editing — spread over eight cities
              with realistic budgets and deadlines.
            </p>
          </div>
        </div>

        <button
          onClick={seed}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
        >
          {loading ? <Spinner className="h-4 w-4" /> : <Database className="h-4 w-4" />}
          Seed 40 workers and 100 jobs
        </button>

        {result && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm text-success-strong">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {result}
          </p>
        )}
        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive-strong">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border-soft bg-surface p-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground-soft">
          <AlertCircle className="h-4 w-4" /> Note
        </p>
        <p className="mt-2 leading-relaxed">
          Sample workers are demo profiles and can't sign in. Seeded jobs appear in the job list
          like any other posting — filter or search them there.
        </p>
      </div>
    </div>
  );
}
