import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ChevronDown, MapPin, Search, Sparkles, Star, Wand2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  findBestWorkers,
  type AiWorkerMatch,
  type FindBestWorkersResult,
  type FilledJobInfo,
  type KeywordWorkerMatch,
  type MatchedWorker,
} from '@/lib/match.functions';
import { MATCH_WEIGHTS, type MatchComponentKey } from '@/lib/match-scoring';
import { MatchScore, SkillTag, Spinner } from '@/components/app-ui';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const COMPONENT_LABELS: Record<MatchComponentKey, string> = {
  ai: 'AI judgement',
  skills: 'Skill overlap',
  city: 'Same city',
  price: 'Price fit',
  rating: 'Rating',
};
const COMPONENT_ORDER: MatchComponentKey[] = ['ai', 'skills', 'city', 'price', 'rating'];

type Status = 'idle' | 'loading' | 'done' | 'error';

export function BestWorkersPanel({
  jobId,
  onJobInfoFilled,
}: {
  jobId: string;
  onJobInfoFilled?: (info: FilledJobInfo) => void;
}) {
  const runFind = useServerFn(findBestWorkers);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<Extract<FindBestWorkersResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);

  const find = async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await runFind({ data: { jobId } });
      if (res.ok) {
        setResult(res);
        if (res.filledInfo) onJobInfoFilled?.(res.filledInfo);
        setStatus('done');
      } else {
        setError(res.error);
        setStatus('error');
      }
    } catch {
      setError("We couldn't reach the matching service. Check your connection and try again.");
      setStatus('error');
    }
  };

  const aiRank = new Map(result?.matches.map((m, i) => [m.worker_id, i + 1]) ?? []);
  const keywordRank = new Map(result?.keyword.map((k, i) => [k.worker_id, i + 1]) ?? []);

  return (
    <section className="mt-6" aria-labelledby="best-workers-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="best-workers-heading" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Wand2 className="h-5 w-5 text-primary" /> Best workers for this job
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            AI compares local workers' skills, city, rate and rating with this job.
          </p>
        </div>
        <button
          onClick={find}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Spinner className="h-4 w-4" />
          ) : status === 'done' ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {status === 'loading' ? 'Finding workers…' : status === 'done' ? 'Refresh matches' : 'Find best workers'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            Comparing workers with AI — this usually takes 10–30 seconds…
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border-soft bg-card" />
          ))}
        </div>
      )}

      {status === 'error' && error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-destructive-ring bg-destructive-soft p-4 text-sm text-destructive-strong"
        >
          <p className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
          <button onClick={find} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Top {result.matches.length} of {result.candidateCount} shortlisted workers.
              {result.filledInfo && ' AI also filled in the missing skills and hours for this job.'}
            </p>
            <div className="flex items-center gap-2">
              <Switch id="compare-keyword" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare-keyword" className="cursor-pointer text-sm font-medium text-foreground-soft">
                Compare with keyword search
              </Label>
            </div>
          </div>

          <div className={compare ? 'grid gap-4 md:grid-cols-2' : ''}>
            <div>
              {compare && (
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> AI match
                </h3>
              )}
              <ol className="space-y-3">
                {result.matches.map((m, i) => (
                  <AiCard
                    key={m.worker_id}
                    m={m}
                    rank={i + 1}
                    compact={compare}
                    keywordRank={keywordRank.get(m.worker_id) ?? null}
                  />
                ))}
              </ol>
            </div>

            {compare && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Search className="h-4 w-4 text-primary" /> Keyword search
                </h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Ranked only by words from the job description found in each worker's skills or bio.
                </p>
                {result.keyword.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                    No worker profiles share keywords with this job description.
                  </div>
                ) : (
                  <ol className="space-y-3">
                    {result.keyword.map((k, i) => (
                      <KeywordCard key={k.worker_id} k={k} rank={i + 1} aiRank={aiRank.get(k.worker_id) ?? null} />
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function WorkerMeta({ w }: { w: MatchedWorker }) {
  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" /> {w.city || '—'}
      </span>
      <span>{w.hourly_rate != null ? `$${w.hourly_rate}/hr` : 'Rate not set'}</span>
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-current text-warning" />
        {w.rating != null ? `${w.rating.toFixed(1)} (${w.review_count})` : 'No reviews yet'}
      </span>
    </p>
  );
}

function RankBubble({ rank }: { rank: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
      {rank}
    </span>
  );
}

function AiCard({
  m,
  rank,
  compact,
  keywordRank,
}: {
  m: AiWorkerMatch;
  rank: number;
  compact: boolean;
  keywordRank: number | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-border-soft bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <RankBubble rank={rank} />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{m.full_name}</p>
            <WorkerMeta w={m} />
          </div>
        </div>
        <MatchScore score={m.match} />
      </div>
      {!compact && m.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.skills.slice(0, 5).map((s) => (
            <SkillTag key={s} label={s} />
          ))}
        </div>
      )}
      {compact && (
        <p className="mt-2 text-xs text-muted-foreground">
          Keyword search rank: {keywordRank != null ? `#${keywordRank}` : 'not in top 10'}
        </p>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-strong"
      >
        Why this match
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2 rounded-xl bg-surface p-3">
          {COMPONENT_ORDER.map((key) => {
            const value = Math.round(m.components[key]);
            const weight = MATCH_WEIGHTS[key];
            return (
              <div key={key} className="grid grid-cols-[8rem_1fr_auto] items-center gap-2 text-xs">
                <span className="whitespace-nowrap text-foreground-soft">
                  {COMPONENT_LABELS[key]} <span className="text-subtle">· {Math.round(weight * 100)}%</span>
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-track">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
                <span className="w-16 text-right font-medium text-body">
                  {value} · +{(value * weight).toFixed(1)}
                </span>
              </div>
            );
          })}
          {m.estimated_cost != null && (
            <p className="pt-1 text-xs text-muted-foreground">Estimated cost for this job: ${Math.round(m.estimated_cost)}</p>
          )}
          {m.reason && (
            <p className="flex items-start gap-1.5 border-t border-border-soft pt-2 text-sm text-body">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {m.reason}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function KeywordCard({ k, rank, aiRank }: { k: KeywordWorkerMatch; rank: number; aiRank: number | null }) {
  return (
    <li className="rounded-2xl border border-border-soft bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <RankBubble rank={rank} />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{k.full_name}</p>
            <WorkerMeta w={k} />
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-body ring-1 ring-inset ring-border">
          {k.score}% keywords
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {k.matched.slice(0, 6).map((w) => (
          <span key={w} className="rounded-full bg-surface px-2 py-0.5 text-xs text-foreground-soft ring-1 ring-inset ring-border">
            {w}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        AI rank: {aiRank != null ? `#${aiRank}` : 'not in AI top 10'}
      </p>
    </li>
  );
}
