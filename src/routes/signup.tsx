import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/types";
import {
  AuthShell,
  RolePicker,
  AuthButton,
  useAuthError,
  formInputClass,
  Field,
  ResendConfirmation,
} from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — SkillMatch Local" },
      {
        name: "description",
        content: "Join SkillMatch Local as a client to post jobs or as a worker to get matched with gigs.",
      },
      { property: "og:title", content: "Create your account — SkillMatch Local" },
      {
        property: "og:description",
        content: "Post small jobs or get matched with local gigs that fit your skills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const { error, setError } = useAuthError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("at least 6 characters");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="One more step to finish creating your account.">
        <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-4 text-sm text-primary-deep">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account, then sign in.
          </p>
        </div>
        <ResendConfirmation email={email} />
        <Link
          to="/login"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Pick how you want to use SkillMatch Local — you can always do both later."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <RolePicker value={role} onChange={setRole} />
        <Field label="Your name">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Rivera"
            className={formInputClass}
          />
        </Field>
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
            placeholder="At least 6 characters"
            className={formInputClass}
          />
        </Field>
        {error && (
          <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">
            {error}
          </p>
        )}
        <AuthButton loading={loading} label="Create account" />
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-strong">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
