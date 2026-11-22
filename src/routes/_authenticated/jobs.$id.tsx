import { useState } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Job, Profile, WorkerMatch, Application } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { jobDetailQuery, profileQuery } from '@/lib/queries';
import { Spinner, Badge, MatchScore, SkillTag } from '@/components/app-ui';
import { PageSpinner } from '@/components/PageSpinner';
import { BestWorkersPanel } from '@/components/BestWorkersPanel';
import {
  MapPin,
  CalendarDays,
  ArrowLeft,
  Sparkles,
  UserPlus,
  Check,
  Users,
  Clock,
  X,
  Plus,
  Pencil,
} from 'lucide-react';

const CATEGORIES = ['Tutoring', 'Design', 'Repairs', 'Event Help', 'Photo Editing', 'Other'];
const URGENCIES = ['low', 'medium', 'high'];
const URGENCY_TONE: Record<string, 'green' | 'amber' | 'red'> = {
  low: 'green',
  medium: 'amber',
  high: 'red',
};

export const Route = createFileRoute('/_authenticated/jobs/$id')({
  head: () => ({
    meta: [
      { title: 'Job details — SkillMatch Local' },
      { name: 'description', content: 'Job details, AI-suggested skills and the best-matched local workers.' },
      { property: 'og:title', content: 'Job details — SkillMatch Local' },
      { property: 'og:description', content: 'Job details, AI-suggested skills and the best-matched local workers.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  loader: async ({ context, params }) => {
    const profile = await context.queryClient.ensureQueryData(profileQuery(context.user.id));
    await context.queryClient.ensureQueryData(jobDetailQuery(params.id, profile));
  },
  pendingComponent: PageSpinner,
  component: JobDetailPage,
});

function JobDetailPage() {
  const { id } = Route.useParams();
  return <JobDetail key={id} id={id} />;
}

function JobDetail({ id }: { id: string }) {
  const { profile, isAdmin } = useCurrentUser();
  const { data } = useSuspenseQuery(jobDetailQuery(id, profile));
  const queryClient = useQueryClient();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(data.job);
  const matches: WorkerMatch[] = data.matches;
  const [applications, setApplications] = useState<Application[]>(data.applications);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(data.applied);
  const [error, setError] = useState<string | null>(null);
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoDraft, setInfoDraft] = useState({
    category: 'Other',
    required_skills: [] as string[],
    urgency: 'medium',
    estimated_hours: '' as string,
  });
  const [newSkill, setNewSkill] = useState('');
  const [infoError, setInfoError] = useState<string | null>(null);

  const startEditInfo = (j: Job) => {
    setInfoDraft({
      category: CATEGORIES.includes(j.category) ? j.category : 'Other',
      required_skills: j.required_skills ?? [],
      urgency: URGENCIES.includes(j.urgency) ? j.urgency : 'medium',
      estimated_hours: j.estimated_hours != null ? String(j.estimated_hours) : '',
    });
    setInfoError(null);
    setEditingInfo(true);
  };

  const saveInfo = async () => {
    if (!job) return;
    setSavingInfo(true);
    setInfoError(null);
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        category: infoDraft.category,
        required_skills: infoDraft.required_skills,
        urgency: infoDraft.urgency,
        estimated_hours: infoDraft.estimated_hours === '' ? null : Number(infoDraft.estimated_hours),
      })
      .eq('id', job.id);
    setSavingInfo(false);
    if (updateError) {
      setInfoError(updateError.message);
      return;
    }
    setJob({ ...job, ...infoDraft, estimated_hours: infoDraft.estimated_hours === '' ? null : Number(infoDraft.estimated_hours) });
    setEditingInfo(false);
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  const addDraftSkill = () => {
    const s = newSkill.trim().toLowerCase();
    if (s && !infoDraft.required_skills.includes(s)) {
      setInfoDraft({ ...infoDraft, required_skills: [...infoDraft.required_skills, s] });
    }
    setNewSkill('');
  };

  const isOwner = job?.client_id === profile?.id;

  const apply = async () => {
    if (!profile || profile.role !== 'worker' || !job) return;
    setApplying(true);
    setError(null);
    const myMatch = matches.find((m) => m.worker_id === profile.id);
    const score = myMatch?.match_score ?? 0;
    const { error: insertError } = await supabase.from('applications').insert({
      job_id: job.id,
      match_score: score,
      message: `Hi! I'd love to help with "${job.title}".`,
    });
    setApplying(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setApplied(true);
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const decide = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setApplications((apps) =>
      apps.map((a) => (a.id === applicationId ? { ...a, status } : a)),
    );
  };

  if (!job) {
    return (
      <div className="rounded-2xl bg-destructive-soft p-8 text-center text-destructive-strong">
        {error || 'Job not found.'}
        <div className="mt-4">
          <Link to="/jobs" className="font-semibold underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const client = job.profiles as Pick<Profile, 'id' | 'full_name' | 'city'> | null;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.history.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary-strong"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
          <Badge tone={job.status === 'open' ? 'green' : 'slate'}>
            {job.status === 'open' ? 'Open' : 'Filled'}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {job.city || 'Remote'}
          </span>
          <span className="font-semibold text-foreground">${job.budget}</span>
          {job.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> Deadline {job.deadline}
            </span>
          )}
          <Badge tone="blue">{job.category}</Badge>
        </div>
        <p className="mt-5 whitespace-pre-line leading-relaxed text-foreground-soft">{job.description}</p>

        <div className="mt-5 rounded-xl border border-primary-muted bg-primary-soft p-4">
          {!editingInfo ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
                  <Sparkles className="h-4 w-4" /> AI job details
                </p>
                {isOwner && (
                  <button
                    onClick={() => startEditInfo(job)}
                    className="inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-primary-strong ring-1 ring-inset ring-primary-ring transition hover:bg-primary-muted"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="blue">{job.category}</Badge>
                {job.urgency && (
                  <Badge tone={URGENCY_TONE[job.urgency] ?? 'slate'}>
                    {job.urgency === 'high' ? 'Urgent' : `${job.urgency} urgency`}
                  </Badge>
                )}
                {job.estimated_hours != null && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-strong">
                    <Clock className="h-3.5 w-3.5" /> est. {job.estimated_hours}h
                  </span>
                )}
              </div>
              {(job.required_skills?.length ?? 0) > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-primary-strong">Needs:</span>
                  {job.required_skills.map((s) => (
                    <SkillTag key={s} label={s} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
                <Sparkles className="h-4 w-4" /> Edit AI details
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={infoDraft.category}
                  onChange={(e) => setInfoDraft({ ...infoDraft, category: e.target.value })}
                  className="rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={infoDraft.urgency}
                  onChange={(e) => setInfoDraft({ ...infoDraft, urgency: e.target.value })}
                  className="rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                >
                  {URGENCIES.map((u) => (
                    <option key={u} value={u}>{u} urgency</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={infoDraft.estimated_hours}
                  onChange={(e) => setInfoDraft({ ...infoDraft, estimated_hours: e.target.value })}
                  placeholder="hours"
                  className="w-24 rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {infoDraft.required_skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-card py-1 pl-3 pr-1.5 text-xs font-medium text-primary-strong ring-1 ring-inset ring-primary-ring"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        setInfoDraft({
                          ...infoDraft,
                          required_skills: infoDraft.required_skills.filter((k) => k !== s),
                        })
                      }
                      className="rounded-full p-0.5 text-primary-faint transition hover:bg-primary-muted hover:text-primary-strong"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraftSkill();
                    }
                  }}
                  placeholder="add skill"
                  className="w-24 rounded-full border border-primary-ring bg-card px-3 py-1 text-xs text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                />
                <button
                  type="button"
                  onClick={addDraftSkill}
                  className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary-ring transition hover:bg-primary-muted"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              {infoError && <p className="text-xs text-destructive">{infoError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={saveInfo}
                  disabled={savingInfo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {savingInfo && <Spinner className="h-3 w-3" />} Save
                </button>
                <button
                  onClick={() => setEditingInfo(false)}
                  className="rounded-lg border border-primary-ring bg-card px-3 py-1.5 text-xs font-semibold text-primary-strong transition hover:bg-primary-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-5 border-t border-border-soft pt-4 text-sm text-subtle">
          Posted by {client?.full_name || 'a local client'}
        </p>

        {!isOwner && profile?.role === 'worker' && (
          <div className="mt-6">
            {applied ? (
              <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-medium text-success-strong">
                <Check className="h-4 w-4" /> Application sent — the client will see it in their
                ranked list.
              </p>
            ) : job.status === 'open' ? (
              <button
                onClick={apply}
                disabled={applying}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
              >
                {applying ? <Spinner className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                Apply for this job
              </button>
            ) : (
              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">
                This job is no longer accepting applications.
              </p>
            )}
          </div>
        )}
        {error && <p className="mt-3 rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">{error}</p>}
      </div>

      {(isOwner || isAdmin) && (
        <BestWorkersPanel
          jobId={job.id}
          onJobInfoFilled={(info) => {
            setJob((j) => (j ? { ...j, ...info } : j));
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
          }}
        />
      )}

      {isOwner && (
        <div className="mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" /> Applicants ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No applications yet. Workers matched to this job will see it on their dashboard.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((a) => {
                const w = a.profiles as Pick<
                  Profile,
                  'id' | 'full_name' | 'city' | 'skills' | 'hourly_rate'
                > | null;
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{w?.full_name || 'Worker'}</p>
                        <p className="text-xs text-muted-foreground">
                          {w?.city || '—'}
                          {w?.hourly_rate != null && ` · $${w.hourly_rate}/hr`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MatchScore score={a.match_score} />
                        {a.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => decide(a.id, 'accepted')}
                              className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-success-hover"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => decide(a.id, 'rejected')}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <Badge tone={a.status === 'accepted' ? 'green' : 'red'}>{a.status}</Badge>
                        )}
                      </div>
                    </div>
                    {w?.skills && w.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {w.skills.map((s) => (
                          <SkillTag key={s} label={s} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!isOwner && matches.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" /> AI-matched workers
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Ranked by city, skills, and rate fit for this job.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.slice(0, 6).map((m) => (
              <div key={m.worker_id} className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.city}
                      {m.hourly_rate != null && ` · $${m.hourly_rate}/hr`}
                    </p>
                  </div>
                  <MatchScore score={m.match_score} />
                </div>
                {m.bio && <p className="mt-2 line-clamp-2 text-sm text-body">{m.bio}</p>}
                {m.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.skills.slice(0, 4).map((s) => (
                      <SkillTag key={s} label={s} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
