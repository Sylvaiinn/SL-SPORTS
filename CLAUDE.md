# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The app lives in `sports-app/` — a Next.js 16 (App Router) application with TypeScript, Tailwind CSS v4, and Supabase as the backend.

```
sports-app/
  src/
    app/              # Next.js App Router pages
      dashboard/      # Home dashboard with stats and heatmap
      musculation/    # Workout list, new workout, detail & edit
      natation/       # Swim session generator + history
      profil/         # User profile and logout
      login/          # Auth page
    components/       # Shared React components
    lib/
      supabase/       # client.ts (browser) and server.ts (RSC/middleware)
      templates.ts    # Predefined workout templates (A, B, C)
      swimGenerator.ts # Swim session generation logic
      dashboardUtils.ts # Streak, muscle detection, week bounds helpers
    types/
      database.ts     # Supabase table types (profiles, workouts, exercises, sets, swim_sessions)
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
```

## Architecture

**Auth flow:** Middleware (`src/middleware.ts`) protects all routes except `/login`. It uses `@supabase/ssr` to read the session from cookies. The root page (`/`) immediately redirects to `/dashboard`.

**Supabase clients:** Two separate clients exist:
- `src/lib/supabase/server.ts` — for Server Components and Server Actions (uses `next/headers`)
- `src/lib/supabase/client.ts` — for Client Components (`'use client'`), uses browser storage

**Server vs Client Components:** Dashboard and musculation list pages are async Server Components that fetch data server-side with `export const dynamic = 'force-dynamic'`. The natation page and new workout form are Client Components (`'use client'`) because they manage interactive local state before saving.

**Database schema (key tables):**
- `workouts` → `exercises` → `sets` (nested hierarchy for strength training)
- `swim_sessions` stores the generated plan as `plan_json` (JSON blob)
- `profiles` links to Supabase Auth user IDs

**Styling:** Tailwind CSS v4 with a custom dark theme defined via CSS variables in `src/app/globals.css`. Components use inline styles with `var(--accent-blue)`, `var(--bg-card)`, etc. rather than Tailwind utility classes for most styling. Shared CSS class names like `.card`, `.btn`, `.badge`, `.input` are defined in globals.css.

**Data insertion pattern:** Workout creation (`musculation/new`) inserts sequentially: workout → exercises (loop) → sets (bulk insert per exercise). Uses Supabase JS client directly from Client Components.

**Swim generator:** `src/lib/swimGenerator.ts` generates a structured plan (warmup/main/cooldown blocks) entirely client-side. The result is saved to Supabase as a JSON blob in `swim_sessions.plan_json`.

**Templates:** Three predefined workout templates (A/B/C) are defined statically in `src/lib/templates.ts` and loaded into the new workout form without any DB call.
