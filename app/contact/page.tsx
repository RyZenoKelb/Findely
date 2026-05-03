"use client";

import { Mail, MessageCircle } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { locale } = useI18n();

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {locale === "fr" ? "Contact & support" : "Contact & Support"}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-strong">
          {locale === "fr"
            ? "Une question, un bug, ou besoin d'aide ? Contactez-nous par email et nous vous répondrons sous 24 h."
            : "Have a question, found a bug, or need help? Reach out via email and we'll respond within 24 hours."}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:support@findely.app"
            className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent-cyan">
              <Mail size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {locale === "fr" ? "Support général" : "General support"}
              </div>
              <div className="mt-1 text-sm text-muted-strong">
                support@findely.app
              </div>
            </div>
          </a>
          <a
            href="mailto:sales@findely.app"
            className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent-cyan">
              <MessageCircle size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {locale === "fr" ? "Commercial / partenariats" : "Sales & partnerships"}
              </div>
              <div className="mt-1 text-sm text-muted-strong">
                sales@findely.app
              </div>
            </div>
          </a>
        </div>
      </section>
    </PublicShell>
  );
}
