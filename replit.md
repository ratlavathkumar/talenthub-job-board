# TalentHub Job Board

A full-stack job board where candidates can browse, search, and apply for jobs, and employers can post listings and manage applications.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/job-board run dev` — run the frontend (uses $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema (jobs.ts, applications.ts)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/job-board/src/pages/` — React pages (home, jobs, job detail, post-job, admin)
- `artifacts/job-board/src/components/` — Shared UI components

## Architecture decisions

- OpenAPI-first: spec defines contract, codegen produces typed hooks (Orval) and Zod schemas
- Frontend uses generated React Query hooks from `@workspace/api-client-react` exclusively
- Application count is computed via LEFT JOIN + GROUP BY in SQL, not a stored column
- Stats endpoints aggregate from DB on each request (small data, acceptable)
- Seed data pre-loaded: 12 jobs across multiple categories, 4 applications

## Product

- **Home** (`/`) — Hero search bar, live stats dashboard, featured jobs, category browser
- **Jobs** (`/jobs`) — Full listing with sidebar filters (type, category, location, salary, remote)
- **Job Detail** (`/jobs/:id`) — Full job view + inline application form
- **Post a Job** (`/post-job`) — Employer form to create a listing
- **Admin** (`/admin`) — Job management table + application status management

## Gotchas

- Re-run `pnpm --filter @workspace/api-spec run codegen` after any spec change
- `pnpm run typecheck:libs` must pass before the API server typechecks (it builds the lib declarations)
- Express 5: use `/{*splat}` not `*` for wildcard routes; all async handlers need `: Promise<void>`
