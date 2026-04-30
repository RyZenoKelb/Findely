# Findely

Lead generation and lead intelligence SaaS. Next.js 16 App Router · React 19 · Tailwind v4 · Supabase.

## V7 — Production Beta Foundation

Findely is in private beta. V7 moves the product from a polished localStorage demo to a real multi-user SaaS with auth, DB persistence, quotas, and the groundwork for a public API. Payments are intentionally **not** implemented — plans are manually assigned in the DB during beta.

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in Supabase + Google Places values in .env.local
npm run dev
```

The dev server starts at http://localhost:3000.

## Environment variables

See `.env.example` for the canonical template. Key variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (required for auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key (never shipped to browser) |
| `GOOGLE_MAPS_API_KEY` | Google Places API key (optional) |
| `FINDELY_ENABLE_GOOGLE_MAPS` | Toggle Google Places source (default `true`) |
| `NEXT_PUBLIC_FINDELY_ENV` | `development` \| `preview` \| `production` |
| `FINDELY_DEMO_MODE` | Allow unauth demo browsing (default `true` in non-prod) |
| `FINDELY_ALLOW_MOCK_FALLBACK` | Allow silent fallback to mock source (default `true` in non-prod) |

## Supabase setup

1. Create a project at https://supabase.com/.
2. Copy the **Project URL** and the **anon public** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. (Optional) Copy the **service_role** key as `SUPABASE_SERVICE_ROLE_KEY` — only if you plan to run admin tasks or API-key lookups.
4. Run the schema migration:
   - Open the Supabase dashboard → **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → Run.
   - Or, with the Supabase CLI linked: `supabase db push`.
5. **Email confirmation for local dev** — in the Supabase dashboard under **Authentication → Providers → Email**, you can disable "Confirm email" to let signups log in immediately. Leave it enabled for production.

The schema creates 9 tables with Row-Level Security (RLS) enforced on every user-owned table:

- `profiles` (auto-created on signup via trigger; default plan `free`)
- `lead_searches`, `leads`, `lead_lists`, `lead_list_items`, `seen_leads`
- `usage_events` (for quota accounting)
- `api_keys` (public API foundation — hashes only)
- `exports` (CSV export history)

Full RLS policies ensure no cross-user reads or writes. See `supabase/migrations/001_initial_schema.sql` for the complete definition.

## Auth flow

- `/signin` — email + password sign-in. Supabase auth, session in cookie.
- `/signup` — email + password sign-up. A `profiles` row is auto-created by the `handle_new_user` Postgres trigger.
- `/auth/callback` — handles magic-link / email-confirmation code exchange.
- `/signout` — clears the Supabase session and redirects to `/signin`.
- `/app/*` routes are protected by `proxy.ts` (Next.js 16 proxy) which refreshes the session and redirects unauthenticated visitors to `/signin?redirect=<path>` unless `FINDELY_DEMO_MODE=true`.

## Google Places

Findely searches against multiple providers. Google Places is the real data source; a `mockSource` keeps local dev and demo mode working without an API key.

1. Enable the **Places API** in the Google Cloud Console.
2. Create a restricted API key and paste into `.env.local` as `GOOGLE_MAPS_API_KEY`.
3. Leave `FINDELY_ENABLE_GOOGLE_MAPS=true`.

In production, `FINDELY_ALLOW_MOCK_FALLBACK` defaults to `false` — if Google Places fails, the API returns a clean error instead of silently substituting mock data.

## Demo mode vs production

| Mode | Behavior |
|---|---|
| `FINDELY_DEMO_MODE=true` (default in dev) | Unauthenticated visitors can browse `/app/*` with sample data. Sample leads are marked with the "Demo data" badge. |
| `FINDELY_DEMO_MODE=false` (default in prod) | `/app/*` requires auth. The mock source is hidden from source selectors. |
| `FINDELY_ALLOW_MOCK_FALLBACK=false` (default in prod) | `/api/search` returns an error if the requested Google Places source is unavailable — never silently falls back to mock data. |

## Plans & quotas (Option A)

Payments are **not** implemented in V7. Plans are stored as `profiles.plan` and enforced server-side via `lib/quota.ts`.

| Plan | €/mo | Leads/mo | Searches/mo | Exports/mo | API credits | API access |
|---|---:|---:|---:|---:|---:|:---:|
| Free | 0 | 100 | 5 | 3 | 0 | ✗ |
| Starter | 19 | 500 | 50 | ∞ | 0 | ✗ |
| Pro | 49 | 3,000 | 300 | ∞ | 0 | ✗ |
| Agency | 129 | 12,000 | 1,000 | ∞ | 1,000 | ✓ |
| API Starter | 49 | — | — | — | 5,000 | ✓ |
| API Pro | 149 | — | — | — | 25,000 | ✓ |
| API Scale | custom | — | — | — | custom | ✓ |

To assign a plan manually during beta:

```sql
update public.profiles set plan = 'pro' where email = 'user@example.com';
```

Usage resets monthly (UTC calendar month). See `lib/plans.ts` and `lib/quota.ts` for the full logic.

## Public API (Phase 3)

The public API at `/api/v1/search` is scaffolded but not yet live. Credits cost:

- **5 credits** per search request (base)
- **+1 credit** per returned lead

API keys are created from `/app/settings` (coming in Phase 2), stored as SHA-256 hashes with a `findely_live_…` or `findely_test_…` prefix. Only the prefix is displayed after creation — the full key is shown once and never again.

## Local dev workflow

```bash
npm run dev      # start Next.js dev server
npm run lint     # ESLint
npm run build    # production build (fails on TypeScript errors)
```

## Architecture

- **Next.js 16 App Router** — `app/` directory
- **Proxy (`proxy.ts`)** — Next.js 16 replacement for middleware; gates `/app/*` behind auth
- **Supabase SSR** — `lib/supabase/{client,server,proxy,admin}.ts`
- **Storage layer** — `lib/storage.ts` (legacy localStorage) will be replaced in Phase 2 by `lib/data/*` DB-backed modules. Demo/unauthenticated users still use localStorage.
- **Source plumbing** — `lib/sources/{mockSource,googleMapsSource,googleSearchSource,directorySource}.ts` registered in `lib/sources/index.ts`
- **Lead pipeline** — clean → dedupe → detect signals → score (0-100) → filter → sort → limit (in `app/api/search/route.ts`)
- **i18n** — EN/FR dictionaries in `lib/i18n.tsx`, stored locally via `findely:locale`
