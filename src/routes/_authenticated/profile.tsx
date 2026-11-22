import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Spinner, Badge } from '@/components/app-ui';
import { Field, formInputClass } from '@/components/auth-form';
import { Star, MapPin, Clock, Save, Sparkles, Plus, X } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/profile')({
  head: () => ({
    meta: [
      { title: 'Your worker profile — SkillMatch Local' },
      { name: 'description', content: 'Add your skills, city and hourly rate to get better job matches.' },
      { property: 'og:title', content: 'Your worker profile — SkillMatch Local' },
      { property: 'og:description', content: 'Add your skills, city and hourly rate to get better job matches.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: WorkerProfile,
});

function WorkerProfile() {
  const { profile } = useCurrentUser();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState(
    profile?.hourly_rate != null ? String(profile.hourly_rate) : '',
  );
  const [city, setCity] = useState(profile?.city ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.role !== 'worker') {
    return (
      <div className="rounded-2xl border border-warning-ring bg-warning-soft p-8 text-center">
        <h1 className="text-lg font-bold text-warning-deep">Worker profile</h1>
        <p className="mt-2 text-sm text-warning-strong">
          Your account is set up as a client. Client accounts don't have a worker profile — sign up
          with a worker account to build one.
        </p>
      </div>
    );
  }

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        skills,
        hourly_rate: hourlyRate === '' ? null : Number(hourlyRate),
        city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile!.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['profile', profile!.id] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your worker profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete profile gets better AI matches. List your real skills as tags.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-border-soft bg-card p-6 shadow-sm md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className={formInputClass}
            />
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

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell clients about your experience, style, and what you love doing…"
            className={`${formInputClass} resize-none leading-relaxed`}
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground-soft">Skills (tags)</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. photography, tutoring, guitar"
              className={formInputClass}
            />
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center gap-1 rounded-lg bg-primary-soft px-4 text-sm font-semibold text-primary-strong transition hover:bg-primary-muted"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft py-1 pl-3 pr-1.5 text-xs font-medium text-primary-strong ring-1 ring-inset ring-primary-ring"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="rounded-full p-0.5 text-primary-faint transition hover:bg-primary-ring hover:text-primary-strong"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-subtle">
            Tip: use words clients might type in a job description, like "photo editing" or "math
            tutoring".
          </p>
        </div>

        <Field label="Hourly rate (USD)">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-subtle">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="25"
              className={`${formInputClass} pl-7`}
            />
          </div>
        </Field>

        {error && <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">{error}</p>}
        {saved && (
          <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success-strong">
            Profile saved.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          Save profile
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-primary-muted bg-primary-soft p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-primary-deep">How matching works</p>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-primary-strong">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Jobs in your city rank much higher.
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> Your skill tags are matched against job
            titles and descriptions.
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Jobs whose budget covers your hourly rate
            get a boost.
          </li>
        </ul>
        {profile && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-primary">
            <Star className="h-3.5 w-3.5" /> Profile created {new Date(profile.created_at).toLocaleDateString()}
            <Badge tone="green">Worker</Badge>
          </p>
        )}
      </div>

    </div>
  );
}
