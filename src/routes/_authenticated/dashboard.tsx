import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Job, Profile } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { dashboardQuery, profileQuery } from '@/lib/queries';
import { Badge, MatchScore } from '@/components/app-ui';
import { PageSpinner } from '@/components/PageSpinner';
import {
  Sparkles,
  Briefcase,
  ClipboardList,
  MapPin,
  DollarSign,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard — SkillMatch Local' },
      { name: 'description', content: 'Your matched jobs, postings and applications in one place.' },
      { property: 'og:title', content: 'Dashboard — SkillMatch Local' },
      { property: 'og:description', content: 'Your matched jobs, postings and applications in one place.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(profileQuery(context.user.id));
    await context.queryClient.ensureQueryData(dashboardQuery(profile));
  },
  pendingComponent: PageSpinner,
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useCurrentUser();
  const { data } = useSuspenseQuery(dashboardQuery(profile));
  const { matches, myJobs, incoming, myApplications, error } = data;
  const isWorker = profile?.role === 'worker';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isWorker ? 'Your matched jobs' : 'Your job dashboard'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isWorker
              ? 'Ranked by how well each job fits your skills, city, and rate.'
              : 'Track your postings and review incoming applications.'}
          </p>
        </div>
        {!isWorker && (
          <Link
            to="/post-job"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            <PlusCircle className="h-4 w-4" /> Post a job
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-destructive-soft p-4 text-sm text-destructive-strong">{error}</div>
      )}

      {isWorker ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" /> Top matches for you
            </h2>
            {matches.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No matches yet"
                text="Add skills to your profile — matching works off your skill tags, city, and rate."
                linkTo="/profile"
                linkLabel="Complete your profile"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.slice(0, 6).map((m) => (
                  <Link
                    key={m.job_id}
                    to="/jobs/$id"
                    params={{ id: m.job_id }}
                    className="group rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-ring hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-foreground group-hover:text-primary-strong">
                        {m.title}
                      </h3>
                      <MatchScore score={m.match_score} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-body">{m.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {m.city || 'Remote'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground-soft">
                        <DollarSign className="h-3.5 w-3.5" /> {m.budget}
                      </span>
                      <Badge tone="blue">{m.category}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {matches.length > 6 && (
              <Link
                to="/jobs"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-strong"
              >
                Browse all jobs <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <ClipboardList className="h-5 w-5 text-primary" /> Your applications
            </h2>
            {myApplications.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="You haven't applied yet"
                text="Open a matched job and hit Apply — one click and you're in."
                linkTo="/jobs"
                linkLabel="Find jobs"
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm">
                {myApplications.map((a, i) => {
                  const job = a.jobs as Pick<Job, 'id' | 'title' | 'city' | 'budget'> | undefined;
                  return (
                    <Link
                      key={a.id}
                      to="/jobs/$id"
                      params={{ id: job?.id ?? a.job_id }}
                      className={`flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-primary-soft/50 ${
                        i > 0 ? 'border-t border-border-soft' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {job?.title || 'Job'}
                        </p>
                        <p className="text-xs text-muted-foreground">{job?.city}</p>
                      </div>
                      <Badge
                        tone={a.status === 'accepted' ? 'green' : a.status === 'rejected' ? 'red' : 'amber'}
                      >
                        {a.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Jobs posted" value={myJobs.length} icon={Briefcase} />
            <StatCard label="Open jobs" value={myJobs.filter((j) => j.status === 'open').length} icon={Sparkles} />
            <StatCard label="Applications" value={incoming.length} icon={ClipboardList} />
          </div>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <ClipboardList className="h-5 w-5 text-primary" /> Latest applications
            </h2>
            {incoming.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No applications yet"
                text="Once workers apply, they'll show up here ranked by match score."
                linkTo="/jobs"
                linkLabel="Browse jobs"
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm">
                {incoming.map((a, i) => {
                  const job = a.jobs as Pick<Job, 'id' | 'title'> | undefined;
                  const worker = a.profiles as Pick<Profile, 'full_name'> | null;
                  return (
                    <Link
                      key={a.id}
                      to="/jobs/$id"
                      params={{ id: job?.id ?? a.job_id }}
                      className={`flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-primary-soft/50 ${
                        i > 0 ? 'border-t border-border-soft' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {worker?.full_name || 'A worker'} applied
                        </p>
                        <p className="text-xs text-muted-foreground">for {job?.title || 'your job'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MatchScore score={a.match_score} />
                        <Badge
                          tone={a.status === 'accepted' ? 'green' : a.status === 'rejected' ? 'red' : 'amber'}
                        >
                          {a.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Briefcase className="h-5 w-5 text-primary" /> Your postings
            </h2>
            {myJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs posted yet"
                text="Post your first small job and get matched with local workers in minutes."
                linkTo="/post-job"
                linkLabel="Post a job"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myJobs.map((j) => (
                  <Link
                    key={j.id}
                    to="/jobs/$id"
                    params={{ id: j.id }}
                    className="group rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-ring hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-foreground group-hover:text-primary-strong">
                        {j.title}
                      </h3>
                      <Badge tone={j.status === 'open' ? 'green' : 'slate'}>
                        {j.status === 'open' ? 'Open' : 'Filled'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {j.city || 'Remote'}
                      </span>
                      <span className="font-semibold text-foreground-soft">${j.budget}</span>
                      <Badge tone="blue">{j.category}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Briefcase;
}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  linkTo,
  linkLabel,
}: {
  icon: typeof Briefcase;
  title: string;
  text: string;
  linkTo: '/profile' | '/jobs' | '/post-job';
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-faint" />
      <p className="mt-4 font-semibold text-foreground-soft">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      <Link
        to={linkTo}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        {linkLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
