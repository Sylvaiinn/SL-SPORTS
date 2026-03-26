# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The app lives in `sports-app/` — a Next.js 16 (App Router) application with TypeScript, Tailwind CSS v4, and Supabase as the backend.

```
sports-app/
  src/
    app/              # Next.js App Router pages
      dashboard/      # Home dashboard with stats, heatmap, and community trophies
      musculation/    # Workout list, new workout, detail & edit
      natation/       # Swim session generator + history
      course/         # Running sessions: new, history, stats, records
      profil/         # User profile (own + public /profil/[username])
      login/          # Auth page (email/password + WebAuthn)
      api/webauthn/   # 5 API routes: login-options, login-verify, register-options, register-verify, delete
    components/       # Shared React components (charts, trophies, tutorial, WebAuthn UI)
    lib/
      supabase/       # client.ts (browser), server.ts (RSC/middleware), service.ts (admin/service role)
      templates.ts    # Predefined workout templates (A, B, C)
      swimGenerator.ts # Swim session generation logic (client-side, RPE-based pace scaling)
      dashboardUtils.ts # calculateStreak(), detectMuscles(), getCurrentWeekBounds(), toDateStr()
      runUtils.ts     # formatPace(), formatDuration(), parseDuration(), calculateAvgPace(), checkRecords(), estimateCalories()
      muscuConstants.ts # MUSCLE_GROUPS, MUSCLE_COLORS, volume calculations
      trophyEngine.ts # Trophy eligibility and progress computation (TrophyStats interface)
    types/
      database.ts     # Supabase table types
    middleware.ts     # Auth guard — redirects unauthenticated users to /login
```

## Development Commands

All commands run from `sports-app/`:

```bash
cd sports-app
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Environment Variables

Create `sports-app/.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # Required for WebAuthn API routes (admin queries)
NEXT_PUBLIC_APP_DOMAIN=...           # WebAuthn RP_ID; defaults to 'localhost'
```

`next.config.ts` ignores TypeScript and ESLint build errors and injects dummy Supabase env values at build time to prevent prerender crashes — real values must be in `.env.local` for runtime.

## Architecture

**Auth flow:** Middleware (`src/middleware.ts`) protects all routes except `/login`. It uses `@supabase/ssr` to read the session from cookies. The root page (`/`) immediately redirects to `/dashboard`.

**WebAuthn / Biometric auth:** On top of email/password, the app supports passkey login via `@simplewebauthn/browser` + `@simplewebauthn/server` (v13.3.0). Credentials are stored in `webauthn_credentials` and credential IDs are cached in `localStorage`. The five API routes under `app/api/webauthn/` use the service-role Supabase client (`lib/supabase/service.ts`) for admin-level lookups.

**Supabase clients — three variants:**
- `src/lib/supabase/server.ts` — Server Components and Server Actions (uses `next/headers`)
- `src/lib/supabase/client.ts` — Client Components (`'use client'`), uses browser storage
- `src/lib/supabase/service.ts` — API routes that need service role (bypass RLS)

**Server vs Client Components:** Most list/detail pages are async Server Components with `export const dynamic = 'force-dynamic'`. Interactive pages (new workout, natation generator, new run) are Client Components because they manage local state before saving.

**Database schema (key tables):**
- `workouts` → `exercises` → `sets` (strength training hierarchy)
- `swim_sessions` — plan stored as `plan_json` (JSON blob)
- `run_sessions` — distance_km, duration_seconds, type, surface, weather, difficulty, shoe_id
- `run_records` — personal records per distance (1km, 5km, 10km, Semi, Marathon)
- `trophies` — unlocked achievements per user (trophy_key, unlocked_at)
- `webauthn_credentials` — passkey public keys and counters
- `profiles` — links to Supabase Auth user IDs; supports public profile viewing via `/profil/[username]`

**Trophy / achievement system:** `src/lib/trophyEngine.ts` defines 8+ trophies (first_session, streak_7, century, centurion, poisson, ironman, early_bird, night_owl, record_breaker). Trophy eligibility is computed from a `TrophyStats` object assembled on the dashboard.

**Running module constants** (`runUtils.ts` / `course/` pages):
- `RUN_TYPES`: Endurance, Fractionné, Tempo, Trail, Récupération, Compétition (each with a color)
- `RUN_SURFACES` and `RUN_WEATHER` with emoji icons
- `RECORD_DISTANCES`: 1km, 5km, 10km, Semi-marathon, Marathon

**Styling:** Tailwind CSS v4 with a custom dark theme via CSS variables in `src/app/globals.css`. Components use inline `style={{ color: 'var(--accent-blue)' }}` rather than Tailwind utilities for most colours. Shared CSS classes (`.card`, `.btn`, `.badge`, `.input`, `.tab-bar`, `.trophy-card`, `.progress-track`, `.heatmap-cell`, etc.) and animation keyframes (`trophyGlow`, `slideIn`, `shimmer`, tutorial step transitions) are all defined in `globals.css`. CSS variable naming: `--accent-*` for colours, `--bg-*` for backgrounds, `--*-glow` variants for box-shadow.

**Data insertion pattern:** Workout creation inserts sequentially — workout → exercises (loop) → sets (bulk per exercise) — using the browser Supabase client from a Client Component.

**Swim generator:** `src/lib/swimGenerator.ts` generates warmup/main/cooldown blocks entirely client-side and saves the result as JSON to `swim_sessions.plan_json`.

**UI language:** All strings are in French (Musculation, Natation, Course à pied, Profil, etc.).
