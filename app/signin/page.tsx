"use client";

import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

export default function SignInPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/app");
  }

  const copy =
    locale === "fr"
      ? {
          title: "Connexion à Findely",
          sub: "L’auth n’est pas branchée en V1 — ce placeholder vous amène directement dans la démo.",
          email: "Email professionnel",
          password: "Mot de passe",
          cta: "Accéder à l’espace de travail",
          demo: "Ignorer et ouvrir la démo",
          or: "ou",
          legal:
            "En continuant, vous acceptez les conditions d’utilisation et la politique de confidentialité.",
        }
      : {
          title: "Sign in to Findely",
          sub: "Auth is not wired up in V1 — this placeholder drops you straight into the demo workspace.",
          email: "Work email",
          password: "Password",
          cta: "Continue to workspace",
          demo: "Skip and open the demo",
          or: "or",
          legal:
            "By continuing you agree to the terms of service and privacy policy.",
        };

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-md flex-col items-center px-5 py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-strong">
            <Sparkles size={12} className="text-accent-cyan" />
            {t.hero.badge}
          </span>
          <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight text-foreground">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-strong">
            {copy.sub}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full rounded-2xl border border-border bg-surface p-6 glow-accent"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">{copy.email}</Label>
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
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pw">{copy.password}</Label>
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
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight size={14} />}
              >
                {copy.cta}
              </Button>
            </div>
            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
              <span className="h-px flex-1 bg-border" />
              {copy.or}
              <span className="h-px flex-1 bg-border" />
            </div>
            <LinkButton
              href="/app"
              variant="outline"
              size="md"
              className="w-full"
            >
              {copy.demo}
            </LinkButton>
          </form>

          <p className="mt-4 max-w-sm text-center text-[11px] leading-relaxed text-muted">
            {copy.legal}
          </p>
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
