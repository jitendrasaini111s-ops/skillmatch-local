import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Job, Profile } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { jobsListQuery } from '@/lib/queries';
import { Badge } from '@/components/app-ui';
import { PageSpinner } from '@/components/PageSpinner';
import { Search, MapPin, CalendarDays, DollarSign, Briefcase, PlusCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Tutoring', 'Design', 'Repairs', 'Event Help', 'Photo Editing', 'Other'];

export const Route = createFileRoute('/_authenticated/jobs/')({
  head: () => ({
    meta: [
      { title: 'Browse jobs — SkillMatch Local' },
      { name: 'description', content: 'Search local micro-gigs by category, city and budget.' },
      { property: 'og:title', content: 'Browse jobs — SkillMatch Local' },
      { property: 'og:description', content: 'Search local micro-gigs by category, city and budget.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsListQuery()),
  pendingComponent: PageSpinner,
  component: JobList,
});

function JobList() {
  const { profile } = useCurrentUser();
  const { data: jobs } = useSuspenseQuery(jobsListQuery());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [maxBudget, setMaxBudget] = useState('');

  const cities = useMemo(
    () => ['All', ...Array.from(new Set(jobs.map((j) => j.city).filter(Boolean))).sort()],
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (category !== 'All' && j.category !== category) return false;
      if (cityFilter !== 'All' && j.city !== cityFilter) return false;
      if (maxBudget && j.budget > Number(maxBudget)) return false;
      if (
        q &&
        !j.title.toLowerCase().includes(q) &&
        !j.description.toLowerCase().includes(q) &&
        !j.category.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [jobs, search, category, cityFilter, maxBudget]);

  const clientName = (j: Job) => {
    const p = j.profiles as Pick<Profile, 'id' | 'full_name' | 'city'> | null;
    return p?.full_name || 'Local client';
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} open {filtered.length === 1 ? 'job' : 'jobs'} across all categories
          </p>
        </div>
        {profile?.role === 'client' && (
          <Link
            to="/post-job"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            <PlusCircle className="h-4 w-4" /> Post a job
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-border-soft bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, descriptions, skills…"
              className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-2.5 text-sm text-foreground-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All cities' : c}
              </option>
            ))}
          </select>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="number"
              min="0"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max budget"
              className="w-full rounded-lg border border-border py-2.5 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-body hover:bg-primary-soft hover:text-primary-strong'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-faint" />
          <p className="mt-4 font-semibold text-foreground-soft">No jobs match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try widening the search or clearing filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((j) => (
            <Link
              key={j.id}
              to="/jobs/$id"
              params={{ id: j.id }}
              className="group rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-ring hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground group-hover:text-primary-strong">{j.title}</h3>
                <Badge tone={j.status === 'open' ? 'green' : 'slate'}>
                  {j.status === 'open' ? 'Open' : 'Filled'}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">
                {j.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {j.city || 'Remote'}
                </span>
                <span className="font-semibold text-foreground-soft">${j.budget}</span>
                {j.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> due {j.deadline}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3">
                <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-strong ring-1 ring-inset ring-primary-ring">
                  {j.category}
                </span>
                <span className="text-xs text-subtle">by {clientName(j)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
