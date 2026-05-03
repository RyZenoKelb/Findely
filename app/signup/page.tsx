"use client";

import { ArrowRight, Lock, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

export default function SignUpPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [mustConfirm, setMustConfirm] = React.useState(false);

  const a = t.auth;
  const supabaseReady = env.supabaseConfigured;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabaseReady) {
      setError(a?.setupMissing ?? "Supabase not configured.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName || null },
        },
      });
      if (err) {
        setError(err.message || a?.genericError || "Sign up failed.");
        setLoading(false);
        return;
      }
      // Session present → email confirmation is disabled in Supabase project
      // settings → jump straight to /app.
      if (data.session) {
        router.push("/app");
        router.refresh();
        return;
      }
      setMustConfirm(true);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || a?.genericError || "Sign up failed.");
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-md flex-col items-center px-5 py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs text-muted-strong">
            <Sparkles size={12} className="text-accent-cyan" />
            {t.hero.badge}
          </span>
          <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight text-foreground">
            {a?.signUpTitle ?? "Create your account"}
          </h1>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-strong">
            {a?.signUpSubtitle ?? ""}
          </p>

          {mustConfirm ? (
            <div className="mt-8 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center glow-accent">
              <h2 className="text-lg font-semibold text-foreground">
                {a?.checkInbox ?? "Check your inbox"}
              </h2>
              <p className="mt-2 text-sm text-muted-strong">
                {a?.checkInboxBody ?? ""}
              </p>
              <div className="mt-4 text-xs text-muted">
                <Link href="/signin" className="hover:text-foreground">
                  ← {a?.switchToSignIn ?? "Sign in"}
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 glow-accent"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{a?.fullNameLabel ?? "Full name"}</Label>
                  <div className="relative">
                    <User
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <Input
                      id="name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">{a?.emailLabel ?? "Email"}</Label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@agency.com"
                      className="pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pw">{a?.passwordLabel ?? "Password"}</Label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <Input
                      id="pw"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    {a?.passwordMinHint ?? ""}
                  </p>
                </div>
                {error ? (
                  <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </div>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight size={14} />}
                  disabled={loading || !supabaseReady}
                >
                  {loading ? "…" : a?.signUpCta ?? "Create account"}
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-muted">
                {a?.haveAccount ?? "Already have an account?"}{" "}
                <Link
                  href="/signin"
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  {a?.switchToSignIn ?? "Sign in"}
                </Link>
              </div>
            </form>
          )}

          {!supabaseReady ? (
            <p className="mt-4 max-w-sm text-center text-[11px] leading-relaxed text-muted">
              {a?.setupMissing ?? ""}
            </p>
          ) : null}
          <div className="mt-6 text-xs text-muted">
            <Link href="/" className="hover:text-foreground">
              ← {t.nav.backToSite}
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
