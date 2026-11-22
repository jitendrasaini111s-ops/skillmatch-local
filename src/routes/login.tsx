import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthButton, useAuthError, formInputClass, Field, ResendConfirmation } from "@/components/auth-form";

const searchSchema = z.object({ redirect: z.string().optional() });

/** Only allow same-origin relative paths as post-login targets. */
function safeRedirect(target: string | undefined): string {
  if (!target) return "/dashboard";
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return "/dashboard";
    const path = url.pathname + url.search + url.hash;
    return path.startsWith("/login") ? "/dashboard" : path;
  } catch {
    return "/dashboard";
  }
}

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — SkillMatch Local" },
      { name: "description", content: "Sign in to manage your jobs, applications and matches." },
      { property: "og:title", content: "Sign in — SkillMatch Local" },
      { property: "og:description", content: "Sign in to manage your jobs, applications and matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const search = Route.useSearch();
  const { error, setError } = useAuthError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.history.push(safeRedirect(search.redirect));
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your jobs and matches.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={formInputClass}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={formInputClass}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:text-primary-strong"
          >
            Forgot your password?
          </Link>
        </div>
        {error && (
          <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">
            {error}
          </p>
        )}
        {error && /confirm your email/i.test(error) && <ResendConfirmation email={email} />}
        <AuthButton loading={loading} label="Sign in" />
      </form>
      <div className="mt-6 rounded-xl border border-primary-muted bg-primary-soft px-4 py-3 text-xs leading-relaxed text-primary-deep">
        Had an account before we moved?{" "}
        <Link to="/forgot-password" className="font-semibold underline">
          Verify your email and choose a new password
        </Link>{" "}
        — your profile and jobs are waiting for you.
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to SkillMatch Local?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-strong">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
