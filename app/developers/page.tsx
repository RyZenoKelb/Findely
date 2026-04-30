"use client";

import { Code2, KeyRound, Zap } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

const SEARCH_CURL = `curl -X POST https://your.findely.app/api/v1/search \\
  -H "Authorization: Bearer findely_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "businessType": "restaurants",
    "location": "Paris, France",
    "objective": "no_website",
    "limit": 20
  }'`;

const USAGE_CURL = `curl https://your.findely.app/api/v1/usage \\
  -H "Authorization: Bearer findely_live_..."`;

const SEARCH_RESPONSE = `{
  "leads": [
    {
      "id": "lead_abc…",
      "name": "Saffron & Co.",
      "category": "Restaurant",
      "phone": "+33 1 42 00 00 00",
      "website": null,
      "address": "12 rue de Rivoli, 75001 Paris",
      "source": "google_maps",
      "score": 92,
      "priorityLabel": "High priority",
      "opportunityType": "high_potential",
      "opportunityReason": "No website — prime prospect for a web agency",
      "recommendedAction": "Call to pitch a landing page + Google Business profile",
      "signals": ["no_website", "has_phone", "has_address"]
    }
  ],
  "meta": {
    "total": 20,
    "sourcesUsed": ["google_maps"],
    "durationMs": 842,
    "credits": { "charged": 25, "remainingEstimate": 4975 },
    "apiKey": { "prefix": "findely_live_abc123def456" }
  }
}`;

const USAGE_RESPONSE = `{
  "plan": "api_starter",
  "apiKey": { "prefix": "findely_live_abc123def456" },
  "credits": { "limit": 5000, "used": 312, "remaining": 4688 },
  "apiSearches": 18,
  "cycle": {
    "start": "2026-04-01T00:00:00.000Z",
    "end":   "2026-05-01T00:00:00.000Z"
  }
}`;

const ERROR_TABLE: [string, string, string][] = [
  ["400", "bad_request", "Malformed JSON body"],
  ["401", "unauthorized", "Missing or invalid API key"],
  ["402", "quota_exceeded", "Plan quota reached for this cycle"],
  ["403", "quota_exceeded", "Plan does not include API access"],
  ["422", "bad_request", "Validation failed (see `issues`)"],
  ["429", "rate_limited", "Too many requests — see Retry-After"],
];

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <figure className="rounded-xl border border-border bg-surface">
      <figcaption className="border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export default function DevelopersPage() {
  const { t } = useI18n();
  const d = t.developers;

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-2 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
            <Code2 size={12} />
            {d?.gettingStarted ?? "Getting started"}
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {d?.title ?? "Findely API"}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-strong">
            {d?.subtitle ?? ""}
          </p>
          <div className="mt-6">
            <LinkButton
              href="/app/api-keys"
              size="md"
              leftIcon={<KeyRound size={14} />}
            >
              {d?.createKeyCta ?? "Create an API key"}
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl space-y-10 px-5 pb-24 lg:pb-28">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <KeyRound size={16} className="text-accent-cyan" />
            {d?.authTitle ?? "Authentication"}
          </h2>
          <p className="mt-2 text-sm text-muted-strong">{d?.authBody ?? ""}</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface px-4 py-3 font-mono text-[12.5px] text-foreground">
            <code>Authorization: Bearer findely_live_...</code>
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {d?.searchTitle ?? "POST /api/v1/search"}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <CodeBlock code={SEARCH_CURL} label="Request" />
            <CodeBlock code={SEARCH_RESPONSE} label="Response" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {d?.usageTitle ?? "GET /api/v1/usage"}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <CodeBlock code={USAGE_CURL} label="Request" />
            <CodeBlock code={USAGE_RESPONSE} label="Response" />
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Zap size={16} className="text-accent-cyan" />
            {d?.creditsTitle ?? "Credits"}
          </h2>
          <p className="mt-2 text-sm text-muted-strong">{d?.creditsBody ?? ""}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {d?.rateLimitsTitle ?? "Rate limits"}
          </h2>
          <p className="mt-2 text-sm text-muted-strong">
            {d?.rateLimitsBody ?? ""}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {d?.errorsTitle ?? "Errors"}
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.15em] text-muted">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_TABLE.map(([status, code, desc]) => (
                  <tr
                    key={status + code}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-foreground">{status}</td>
                    <td className="px-4 py-3 font-mono text-muted-strong">{code}</td>
                    <td className="px-4 py-3 text-muted-strong">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
