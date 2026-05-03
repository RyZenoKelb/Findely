"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safeRedirect";

export default function SignInPage() {
  return (
    <React.Suspense fallback={null}>
      <SignInForm />
    </React.Suspense>
  );
}

function SignInForm() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = safeRedirectPath(search.get("redirect"), "/app");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message || a?.genericError || "Sign in failed.");
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || a?.genericError || "Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-md flex-col items-center px-5 py-20 lg:py-28">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
            {a?.signInTitle ?? "Welcome back"}
          </h1>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-strong">
            {a?.signInSubtitle ?? ""}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 glow-accent"
          >
            <div className="space-y-4">
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
                    autoComplete="current-password"
                  />
                </div>
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
                {loading ? "…" : a?.signInCta ?? "Sign in"}
              </Button>
            </div>

            <div className="mt-4 text-center text-xs text-muted">
              {a?.noAccount ?? "New to Findely?"}{" "}
              <Link
                href="/signup"
                className="text-foreground underline-offset-2 hover:underline"
              >
                {a?.switchToSignUp ?? "Create one"}
              </Link>
            </div>

            {env.demoMode ? (
              <>
                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
                  <span className="h-px flex-1 bg-border" />
                  {a?.orDivider ?? "or"}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <LinkButton
                  href="/app"
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  {a?.openDemo ?? "Open the demo"}
                </LinkButton>
              </>
            ) : null}
          </form>

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
