# Backend (Express + Drizzle + Supabase Postgres)

This backend provides the todo CRUD API and enforces the same ABAC rules server-side.

## Setup

1) Create `backend/.env` (use `backend/env.example` as a starting point).

Required:

- `DATABASE_URL`: Supabase Postgres connection string
- `PORT` (default: `4000`)
- `FRONTEND_ORIGIN` (default: `http://localhost:3000`)

2) Install dependencies from repo root:

```bash
pnpm install
```

3) Generate a migration and apply it:

```bash
pnpm -C backend db:generate
pnpm -C backend db:migrate
```

4) Run the API:

```bash
pnpm -C backend dev
```

## Demo auth (temporary)

For now the API expects a header:

- `x-demo-user-id: u_alice | u_bob | u_mona | u_ada`

This is only to keep the project “frontend-first” while we hook up real Better Auth later.


