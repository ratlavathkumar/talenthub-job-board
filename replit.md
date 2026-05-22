# TalentHub Job Board

A full-stack job board with a 3-role auth system (Candidate / Company / Super Admin), file uploads for resumes and profile images, and a premium orange-branded UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000/8080)
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
- Auth: express-session + bcryptjs (no external auth provider)
- Storage: Replit Object Storage (file uploads)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth for jobs/applications/stats)
- `lib/db/src/schema/` — Drizzle DB schema (jobs.ts, applications.ts, users.ts, companies.ts)
- `artifacts/api-server/src/routes/` — Express route handlers (jobs, auth, storage, admin)
- `artifacts/api-server/src/lib/objectStorage.ts` — Replit object storage helpers
- `artifacts/job-board/src/pages/` — React pages
- `artifacts/job-board/src/components/` — Shared UI components
- `artifacts/job-board/src/contexts.tsx` — All React contexts (Auth, Admin, Theme)
- `artifacts/job-board/src/hooks/` — Custom hooks (use-file-upload, use-user-auth, use-company-auth)

## Architecture decisions

- OpenAPI-first: spec defines jobs/applications/stats; auth & storage routes are hand-written (to avoid Orval type conflicts with file upload + session types)
- Frontend uses generated React Query hooks from `@workspace/api-client-react` for job/application endpoints; auth endpoints use raw fetch
- Application count is computed via LEFT JOIN + GROUP BY in SQL, not a stored column
- Stats endpoints aggregate from DB on each request (small data, acceptable)
- Seed data pre-loaded: 12 jobs across multiple categories, 4 applications
- All contexts live in `contexts.tsx` to avoid circular import (App.tsx imports → layout.tsx imports → pages import back)
- Storage endpoints NOT in openapi.yaml (would cause duplicate type conflict); Zod schemas are inline in storage.ts

## Auth Roles

| Role | Login | Register | Routes |
|------|-------|----------|--------|
| Candidate | `/login` | `/register` | Profile, Track Applications, Apply |
| Company | `/company-login` | `/company-register` | Company Dashboard |
| Super Admin | `/login` (email: admin@talenthub.com) | — | `/admin` |

## API Endpoints (auth & admin — NOT in openapi.yaml)

```
POST /api/auth/user/register   — candidate register
POST /api/auth/user/login      — candidate login
GET  /api/auth/user/me         — current candidate session
POST /api/auth/user/logout     — candidate logout

POST /api/auth/company/register — company register
POST /api/auth/company/login    — company login
GET  /api/auth/company/me       — current company session
POST /api/auth/company/logout   — company logout

GET    /api/admin/users          — list all candidates (admin only)
DELETE /api/admin/users/:id      — delete candidate (admin only)
GET    /api/admin/companies      — list all companies (admin only)
PATCH  /api/admin/companies/:id  — toggle approval (admin only)
DELETE /api/admin/companies/:id  — delete company (admin only)

POST /api/storage/upload         — upload file → returns objectPath
GET  /api/storage/sign/:path     — get signed URL for private file
```

## Product

- **Home** (`/`) — Hero search bar, live stats dashboard, featured jobs, category browser
- **Jobs** (`/jobs`) — Full listing with sidebar filters (type, category, location, salary, remote)
- **Job Detail** (`/jobs/:id`) — Full job view + inline application form with resume upload
- **Post a Job** (`/post-job`) — Employer form to create a listing
- **Admin** (`/admin`) — Job management, application status, analytics, **Users tab**, **Companies tab**
- **Profile** (`/profile`) — Candidate profile with photo upload + application history
- **Company Dashboard** (`/company-dashboard`) — Company profile management
- **Sign In** (`/login`) — Candidate login
- **Register** (`/register`) — Candidate registration
- **Company Sign In** (`/company-login`) — Company login
- **Company Register** (`/company-register`) — Company registration

## Branding

- Primary orange: `hsl(25, 95%, 53%)` — used for logo, buttons, CTAs
- Company portal: violet gradient (`from-violet-600 to-violet-700`)
- Admin portal: guarded by `<AdminGate>` component (email: admin@talenthub.com)

## Gotchas

- Re-run `pnpm --filter @workspace/api-spec run codegen` after any spec change
- `pnpm run typecheck:libs` must pass before the API server typechecks (it builds the lib declarations)
- Express 5: use `/{*splat}` not `*` for wildcard routes; all async handlers need `: Promise<void>`
- Session fields: `userId`, `companyId`, `userType` (`"user"` | `"company"` | `"admin"`)
- `zod` must be in `@workspace/api-server` dependencies (not just devDependencies) for esbuild bundling
