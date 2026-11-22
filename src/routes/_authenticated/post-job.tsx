import { useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { analyzeJob } from '@/lib/jobs.functions';
import { Spinner } from '@/components/app-ui';
import { Field, formInputClass } from '@/components/auth-form';
import { Sparkles, X, Plus } from 'lucide-react';

const CATEGORIES = ['Tutoring', 'Design', 'Repairs', 'Event Help', 'Photo Editing', 'Other'];
const URGENCIES = ['low', 'medium', 'high'];

interface ExtractedInfo {
  category: string;
  required_skills: string[];
  urgency: string;
  estimated_hours: number | null;
}

export const Route = createFileRoute('/_authenticated/post-job')({
  head: () => ({
    meta: [
      { title: 'Post a job — SkillMatch Local' },
      { name: 'description', content: 'Describe a small job and let AI fill in the details and find matching local workers.' },
      { property: 'og:title', content: 'Post a job — SkillMatch Local' },
      { property: 'og:description', content: 'Describe a small job and get matched with local workers.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: PostJob,
});

function PostJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runAnalyzeJob = useServerFn(analyzeJob);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [city, setCity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedInfo | null>(null);

  const callExtract = async (): Promise<ExtractedInfo | null> => {
    try {
      const result = await runAnalyzeJob({ data: { title, description, city } });
      if (!result.ok) {
        setFriendlyError(result.error);
        return null;
      }
      return result.info;
    } catch {
      setFriendlyError(
        'We couldn\'t reach the AI service, so the job details were left blank — you can fill them in on the job page.',
      );
      return null;
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFriendlyError(null);

    const info = await callExtract();

    const { error: insertError } = await supabase.from('jobs').insert({
      title,
      description,
      budget: Number(budget),
      city,
      deadline: deadline === '' ? null : deadline,
      category: info?.category ?? 'Other',
      required_skills: info?.required_skills ?? [],
      urgency: info?.urgency ?? '',
      estimated_hours: info?.estimated_hours ?? null,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    navigate({ to: '/jobs' });
  };

  const removeSkill = (s: string) =>
    setExtracted((x) =>
      x ? { ...x, required_skills: x.required_skills.filter((k) => k !== s) } : x,
    );
  const addSkill = () => {
    const input = window.prompt('Add a required skill:');
    const s = input?.trim().toLowerCase();
    if (s && extracted && !extracted.required_skills.includes(s)) {
      setExtracted({ ...extracted, required_skills: [...extracted.required_skills, s] });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Post a job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the task in your own words — our AI reads it to fill in the details below, and
          the matcher ranks the best workers.
        </p>
      </div>

      {friendlyError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-strong">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> {friendlyError}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-border-soft bg-card p-6 shadow-sm md:p-8"
      >
        <Field label="Job title">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Math tutor for 8th grader, twice a week"
            className={formInputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="What needs doing, when, and any skills you're looking for. The more detail, the better the matches."
            className={`${formInputClass} resize-none leading-relaxed`}
          />
        </Field>

        {extracted && (
          <div className="rounded-xl border border-primary-muted bg-primary-soft p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
              <Sparkles className="h-4 w-4" /> AI analysis — click to adjust
            </p>
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-primary-strong">Category</span>
                <select
                  value={extracted.category}
                  onChange={(e) => setExtracted({ ...extracted, category: e.target.value })}
                  className="rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="ml-2 text-xs font-medium text-primary-strong">Urgency</span>
                <select
                  value={extracted.urgency}
                  onChange={(e) => setExtracted({ ...extracted, urgency: e.target.value })}
                  className="rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                >
                  {URGENCIES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-primary-strong">Skills</span>
                {extracted.required_skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-card py-1 pl-3 pr-1.5 text-xs font-medium text-primary-strong ring-1 ring-inset ring-primary-ring"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="rounded-full p-0.5 text-primary-faint transition hover:bg-primary-muted hover:text-primary-strong"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary-ring transition hover:bg-primary-muted"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary-strong">Estimated hours</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={extracted.estimated_hours ?? ''}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      estimated_hours: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-24 rounded-full border border-primary-ring bg-card px-3 py-1 text-xs font-medium text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary-ring"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Budget (USD)">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-subtle">
                $
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="120"
                className={`${formInputClass} pl-7`}
              />
            </div>
          </Field>
          <Field label="City">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Austin"
              className={formInputClass}
            />
          </Field>
        </div>

        <Field label="Deadline (optional)">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={formInputClass}
          />
        </Field>

        {error && <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {saving ? 'Analyzing and publishing…' : 'Publish job'}
        </button>
      </form>
    </div>
  );
}
