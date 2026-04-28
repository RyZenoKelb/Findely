# Findely

> Find targeted leads in seconds. We find. You close.

Findely is a premium web-based **lead intelligence platform**. It searches businesses across multiple sources (including live Google Places), scores every opportunity, detects useful signals, and prepares clean lead lists ready for outreach — in one polished SaaS experience.

Available in **English** and **Français**.

---

## 1. What's in V2

- **Real Google Places provider** (server-side, API-key protected)
- **EN / FR i18n** with a navbar + topbar + settings language switcher
- **Refreshed premium electric-blue design system** (deeper surfaces, stronger glows, subtle motion)
- **New dedicated public pages**: `/features`, `/use-cases`, `/how-it-works`, `/pricing`, `/signin`
- **Hydration fix** — no more nested `<a>` links in the Topbar/Logo
- **Upgraded search results UX** — fallback warning, provider badges, query summary, row-level "Open in Maps"
- **Polished sidebar / topbar** — cleaner active states, language switcher, demo badge

---

## 2. Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Zod · Lucide · localStorage.

No database, auth, or payments in V2. Everything runs locally with the included realistic mock provider; add a Google Places key to unlock live data.

---

## 3. Install & run

```bash
cd findely
npm install

# (Optional) enable live Google Places
cp .env.local.example .env.local
# → edit .env.local and paste your GOOGLE_MAPS_API_KEY

npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

---

## 4. Google Places setup

Findely calls the Places API **server-side only** (from `app/api/search/route.ts`). The key is never sent to the browser.

1. Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. Create a project (or pick an existing one).
3. Enable the **Places API**.
4. Create an API key under **APIs & Services → Credentials**.
5. **Restrict the key** — strongly recommended:
   - **Application restrictions:** HTTP referrers or IPs (for production).
   - **API restrictions:** limit to Places API only.
6. Copy `.env.local.example` to `.env.local` and paste the key:

   ```env
   GOOGLE_MAPS_API_KEY=AIza...your-real-key
   FINDELY_ENABLE_GOOGLE_MAPS=true
   ```

7. Restart `npm run dev`.

Once enabled, the Google Places source shows up in the search form. When you run a search and Google Places fails (missing key, quota exceeded, no results, API disabled), Findely **falls back silently to the mock provider** and shows a yellow banner explaining the fallback.

**Security:**

- The API key is read only in Node.js route handlers and provider files — never exposed client-side.
- `.env.local` is in `.gitignore` — do not commit it.
- For production, restrict the key in Google Cloud Console.

---

## 5. Routes

| Route                | What it is                         |
| -------------------- | ---------------------------------- |
| `/`                  | Landing page                       |
| `/features`          | Public features page               |
| `/use-cases`         | Public use-cases page              |
| `/how-it-works`      | Public how-it-works page           |
| `/pricing`           | Public pricing page + FAQ          |
| `/signin`            | Auth placeholder (routes to /app)  |
| `/app`               | Dashboard overview                 |
| `/app/search`        | Advanced lead search               |
| `/app/lists`         | Lead lists CRUD                    |
| `/app/searches`      | Saved searches                     |
| `/app/usage`         | Usage & plan                       |
| `/app/settings`      | Settings + language switcher       |
| `POST /api/search`   | Provider orchestrator (Zod-validated) |

---

## 6. i18n

Dictionaries: `lib/i18n.tsx` — exports `I18nProvider`, `useI18n()`, and a typed `Dict`. Locale persists in `localStorage["findely:locale"]`.

Switch language from:

- The landing navbar (globe icon, right side)
- The app topbar (globe icon)
- The app settings page (Appearance section)

To add another language: add a new locale to `LOCALES`, a new dictionary object in `lib/i18n.tsx`, and it appears everywhere automatically.

---

## 7. Source provider architecture

All providers implement `LeadSourceProvider` (`lib/sources/types.ts`):

```ts
interface LeadSourceProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  badge?: string;
  search(params: SourceSearchParams): Promise<Lead[]>;
}
```

Registry: `lib/sources/index.ts` exposes `listSources()`, `getProvider(id)`, `resolveProviders(ids)`.

### Built-in providers

| id              | status      | notes                                                               |
| --------------- | ----------- | ------------------------------------------------------------------- |
| `mock`          | full        | Seeded, deterministic, realistic leads per query. Always enabled.   |
| `google_maps`   | **live**    | Real Google Places API. Requires `GOOGLE_MAPS_API_KEY`.             |
| `google_search` | placeholder | Gated by `FINDELY_ENABLE_GOOGLE_SEARCH`.                            |
| `directory`     | placeholder | Gated by `FINDELY_ENABLE_DIRECTORY`.                                |

---

## 8. How to add a new source

See `lib/sources/mockSource.ts` for a full example and `lib/sources/googleMapsSource.ts` for a real-API example (text search + details fetching + env-gated enablement).

---

## 9. Scoring

`lib/leadScoring.ts` — 0–100 with objective-aware bonuses. Source credibility: `google_maps` > `google_search` > `directory` > `mock`.

## 10. Filters

`lib/leadFilters.ts` — `all`, `without_website`, `with_website`, `with_phone`, `missing_contact`, `has_address`, `high_score`, `needs_online_presence`, `outreach_ready`. Plus advanced: `minScore`, `requirePhone`, `requireWebsite`, `includeOnlyContactable`.

## 11. localStorage persistence

| Key                    | Shape               | What                                     |
| ---------------------- | ------------------- | ---------------------------------------- |
| `findely:locale`       | `"en" \| "fr"`      | UI language                              |
| `findely:searches`     | `SearchQuery[]`     | Last 100 saved searches                  |
| `findely:lists`        | `LeadList[]`        | Named lead lists                         |
| `findely:savedLeads`   | `Lead[]`            | Lead cache (notes, statuses, list refs)  |
| `findely:settings`     | `AppSettings`       | Search defaults, export prefs, theme     |
| `findely:usage`        | `UsageStats`        | Searches / leads / exports counters      |

All dates are ISO-8601 UTC.

---

## 12. Known limitations

- Authentication is a UI placeholder — no real sessions.
- No payments — pricing cards are cosmetic.
- `google_search` and `directory` providers are placeholders.
- localStorage only — no cross-device sync.
- Google Places counts against your Cloud billing quota once the key is set.

---

## 13. Next improvements

- Real scrapers for directories and search engines.
- Auth (NextAuth / Clerk / Supabase) + Postgres for cross-device sync.
- Stripe billing + real plan quotas.
- Outreach integrations (Instantly, Smartlead, Gmail drafts).
- AI outreach email generation.
- Enrichment (email finders, domain tech stack, LinkedIn).
- Team workspaces, shared lists, assignment.

---

Built with care. Dark, fast, electric, and ready to demo.
