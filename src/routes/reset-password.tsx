import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthButton, useAuthError, formInputClass, Field } from "@/components/auth-form";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — SkillMatch Local" },
      { name: "description", content: "Choose a new password for your SkillMatch Local account." },
      { property: "og:title", content: "Choose a new password — SkillMatch Local" },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { error, setError } = useAuthError();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The recovery link signs the user in with a short-lived session.
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && isRecovery)) setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something at least 6 characters long.">
      {!ready ? (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-strong">
          Open this page from the link in your email. If the link expired,{" "}
          <Link to="/forgot-password" className="font-semibold underline">
            request a new one
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="New password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formInputClass}
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={formInputClass}
            />
          </Field>
          {error && (
            <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-strong">
              {error}
            </p>
          )}
          <AuthButton loading={loading} label="Save password" />
        </form>
      )}
    </AuthShell>
  );
}
