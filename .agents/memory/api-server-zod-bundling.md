---
name: API server zod bundling
description: zod must be in runtime dependencies (not devDependencies) for esbuild to bundle the API server
---

**Rule:** `zod` must be listed under `dependencies` (not `devDependencies`) in `artifacts/api-server/package.json`.

**Why:** The API server is bundled with esbuild at build time. esbuild resolves packages from `node_modules` at bundle time and will fail with "Could not resolve zod" if zod is only in devDependencies or not installed at all in the api-server package scope.

**How to apply:** Any runtime import used in api-server (not a type-only import) must be in `dependencies`. Type-only packages (`@types/*`, build tools) can stay in devDependencies.
