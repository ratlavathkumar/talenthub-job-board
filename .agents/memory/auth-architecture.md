---
name: Auth architecture
description: Why auth/storage routes are hand-written and not in the OpenAPI spec, and why all contexts live in contexts.tsx
---

Auth and storage routes are NOT in `lib/api-spec/openapi.yaml`.

**Why:** Adding them to the spec causes Orval codegen to generate type definitions that conflict with the hand-crafted session/file-upload types. Keeping them out of the spec avoids duplicate type conflicts.

**How to apply:** When adding new auth or storage endpoints, write them directly in `artifacts/api-server/src/routes/auth.ts` or `storage.ts` — do NOT add to openapi.yaml. Zod schemas for storage are inline in storage.ts.

All React contexts (UserAuthContext, CompanyAuthContext, AdminContext, ThemeContext) live in `artifacts/job-board/src/contexts.tsx`.

**Why:** App.tsx imports layout.tsx, which imports pages, which import contexts → circular import. Splitting contexts into their own file breaks the cycle.

**How to apply:** Any new context must be defined in contexts.tsx, not App.tsx.
