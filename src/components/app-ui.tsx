import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function Badge({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
}) {
  const tones: Record<string, string> = {
    blue: 'bg-primary-soft text-primary-strong ring-primary-ring',
    green: 'bg-success-soft text-success-strong ring-success-ring',
    amber: 'bg-warning-soft text-warning-strong ring-warning-ring',
    red: 'bg-destructive-soft text-destructive-strong ring-destructive-ring',
    slate: 'bg-secondary text-body ring-border',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-strong ring-1 ring-inset ring-primary-ring">
      {label}
    </span>
  );
}

export function MatchScore({ score }: { score: number }) {
  const tone = score >= 75 ? 'green' : score >= 45 ? 'amber' : 'slate';
  const label = score >= 75 ? 'Great match' : score >= 45 ? 'Good match' : 'Possible match';
  return (
    <div className="flex items-center gap-2">
      <Badge tone={tone as 'green' | 'amber' | 'slate'}>{label}</Badge>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-track">
        <div
          className={`h-full rounded-full ${
            score >= 75 ? 'bg-success' : score >= 45 ? 'bg-warning' : 'bg-subtle'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-body">{score}%</span>
    </div>
  );
}
