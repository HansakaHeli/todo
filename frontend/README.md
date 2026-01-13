# Todo ABAC (frontend-only)

Simple todo app with **ABAC policies** and three roles:

- **User**: can view/create/update their own todos; can delete only their own todos in `draft`.
- **Manager**: can view all todos (read-only).
- **Admin**: can view all todos; can delete any todo (any status); cannot create/update.

Tech:

- **Next.js** (App Router)
- **shadcn/ui**
- **TanStack Query**
- **Better Auth** (dependency + scaffold; demo auth is used for this frontend-only milestone)
- **Backend**: Express + Drizzle ORM + Supabase Postgres

## Running locally (Node 22 + pnpm)

```bash
# if you use nvm
nvm install 22
nvm use 22

corepack enable
corepack prepare pnpm@latest --activate

pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Backend setup (Express + Drizzle + Supabase)

1) Create `../backend/.env` from `../backend/env.example` and set:

- `DATABASE_URL`: your Supabase Postgres connection string
- optionally `PORT` (default `4000`) and `FRONTEND_ORIGIN` (default `http://localhost:3000`)

2) Run migrations (from repo root):

```bash
pnpm -C backend db:generate
pnpm -C backend db:migrate
```

3) Run both web + api (from repo root):

```bash
pnpm dev:all
```

## Notes

- **Demo session** is stored in localStorage (`todo2.session.v1`) and can be changed by signing out/in.
- Better Auth integration scaffolding lives in `lib/auth/better-auth-scaffold.ts`.
- **Demo auth header**: the frontend sends `x-demo-user-id` to the backend (temporary until Better Auth is wired end-to-end).
