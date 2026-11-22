import { createFileRoute, Link } from '@tanstack/react-router';
import { useSession } from '@/hooks/use-session';
import {
  Briefcase,
  Sparkles,
  MapPin,
  ClipboardList,
  ArrowRight,
  Star,
  Users,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-powered matching',
    text: 'Our matcher scores every job against skills, city, and rate — so the right people see the right gigs.',
  },
  {
    icon: MapPin,
    title: 'Local first',
    text: 'Every job has a city. Find work near you, or hire someone who can actually show up.',
  },
  {
    icon: ClipboardList,
    title: 'Simple applications',
    text: 'Workers apply in one click. Clients review ranked applicants and accept the best fit.',
  },
];

const categories = [
  { name: 'Tutoring', emoji: '📚' },
  { name: 'Design', emoji: '🎨' },
  { name: 'Repairs', emoji: '🔧' },
  { name: 'Event Help', emoji: '🎉' },
  { name: 'Photo Editing', emoji: '📸' },
];

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'SkillMatch Local — Small jobs, great local people' },
      {
        name: 'description',
        content:
          'Post small jobs or find local gigs. SkillMatch Local ranks the best matches by skills, city and rate.',
      },
      { property: 'og:title', content: 'SkillMatch Local — Small jobs, great local people' },
      {
        property: 'og:description',
        content: 'Post small jobs or find local gigs, matched by skills, city and rate.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Landing,
});

function Landing() {
  const session = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">
            SkillMatch <span className="text-primary">Local</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-body hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary-strong">
            <Zap className="h-3.5 w-3.5" /> Micro-gigs, matched by AI
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
            Small jobs. <span className="text-primary">Great people.</span> Right around the corner.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-body">
            SkillMatch Local connects clients with small tasks to trusted local workers — tutoring,
            design, repairs, event help, photo editing, and more. Our AI ranks the best matches for
            both sides.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
            >
              Create an account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground-soft transition hover:border-primary-ring hover:text-primary-strong"
            >
              Sign in
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {[
              { icon: Users, stat: '40+', label: 'Active workers' },
              { icon: Briefcase, stat: '100+', label: 'Jobs posted' },
              { icon: Star, stat: '4.8', label: 'Avg. rating' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="rounded-2xl border border-border-soft bg-card p-4 shadow-sm">
                <Icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">{stat}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">Popular categories</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground-soft shadow-sm transition hover:border-primary-ring hover:text-primary-strong"
              >
                <span aria-hidden>{c.emoji}</span> {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-foreground">Ready to find your match?</h2>
        <p className="mt-3 text-body">
          Sign up as a client to post jobs, or as a worker to get matched with gigs that fit your
          skills.
        </p>
        <Link
          to="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
        >
          Join SkillMatch Local <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border bg-card py-6">
        <p className="text-center text-sm text-subtle">
          SkillMatch Local — connecting neighborhoods, one gig at a time.
        </p>
      </footer>
    </div>
  );
}
