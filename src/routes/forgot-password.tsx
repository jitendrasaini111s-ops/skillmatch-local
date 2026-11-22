import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthButton, useAuthError, formInputClass, Field } from "@/components/auth-form";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — SkillMatch Local" },
      { name: "description", content: "Verify your email and choose a new SkillMatch Local password." },
      { property: "og:title", content: "Reset your password — SkillMatch Local" },
      { property: "og:description", content: "Verify your email and choose a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { error, setError } = useAuthError();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter your account email and we'll send you a secure link to choose a new password."
    >
      {sent ? (
        <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-4 text-sm text-primary-deep">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            If an account exists for <strong>{email}</strong>, a link is on its way. Open it on this
            device to choose your new password.
          </p>
        </div>
      ) : (
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
          {error && (
            <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">
              {error}
            </p>
          )}
          <AuthButton loading={loading} label="Send link" />
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-strong">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
