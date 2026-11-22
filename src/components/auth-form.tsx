import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Briefcase } from 'lucide-react';
import { Spinner } from '@/components/app-ui';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-soft to-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground">
            SkillMatch <span className="text-primary">Local</span>
          </span>
        </Link>
        <div className="rounded-2xl border border-border-soft bg-card p-8 shadow-xl shadow-border/50">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function RolePicker({
  value,
  onChange,
}: {
  value: 'client' | 'worker';
  onChange: (role: 'client' | 'worker') => void;
}) {
  const roles: { id: 'client' | 'worker'; title: string; text: string }[] = [
    { id: 'client', title: 'I need a job done', text: 'Post small jobs and hire local workers' },
    { id: 'worker', title: 'I want to work', text: 'Get matched with gigs near you' },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {roles.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={`rounded-xl border-2 p-4 text-left transition ${
            value === r.id
              ? 'border-primary bg-primary-soft'
              : 'border-border bg-card hover:border-primary-ring'
          }`}
        >
          <p className={`text-sm font-bold ${value === r.id ? 'text-primary-strong' : 'text-foreground'}`}>
            {r.title}
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{r.text}</p>
        </button>
      ))}
    </div>
  );
}

export function AuthButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Spinner className="h-4 w-4" />}
      {loading ? 'Please wait…' : label}
    </button>
  );
}

export function useAuthError() {
  const [error, setError] = useState<string | null>(null);
  const friendly = (message: string) => {
    if (message.includes('already registered')) return 'This email is already registered. Try signing in instead.';
    if (message.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.';
    if (message.includes('at least 6 characters')) return 'Password must be at least 6 characters long.';
    return message;
  };
  return { error, setError: (m: string) => setError(friendly(m)) };
}

export const formInputClass =
  'w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground-soft">{label}</span>
      {children}
    </label>
  );
}

