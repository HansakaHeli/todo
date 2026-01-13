/**
 * Better Auth integration scaffold (frontend-only milestone)
 *
 * This repo is intentionally "no separate backend" right now.
 * When you're ready to make authentication real with Better Auth, the typical Next.js App Router setup is:
 * - Create a route handler under `app/api/auth/[...better-auth]/route.ts`
 * - Configure Better Auth there (providers, session strategy, adapter/database)
 * - Use Better Auth client helpers on the frontend to get the session + sign in/out.
 *
 * For the current milestone we use `lib/auth/demo-auth.tsx` (localStorage-backed demo session)
 * so we can focus on the ABAC rules and UI.
 */

export const BETTER_AUTH_NEXT_STEPS = [
  "Add `app/api/auth/[...better-auth]/route.ts` and initialize Better Auth server handler.",
  "Pick an adapter (e.g. SQLite/Postgres) to persist users and sessions.",
  "Replace demo auth context with Better Auth client session hook.",
] as const;


