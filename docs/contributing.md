# Contributing

> Quick-start, conventions, and PR workflow for **Fusion**.

---

## Prerequisites

- **Node 20+** (`node -v`)
- **pnpm 9+** (`npm i -g pnpm` or use `corepack enable && corepack prepare pnpm@latest --activate`)
- **Postgres 14+** — *optional in dev*, the tRPC routers have a mock fallback for onboarding
- **Redis** — *optional*, only needed for BullMQ workers

---

## First-time setup

```bash
git clone https://github.com/ik123a/fusion.git
cd fusion
pnpm install
pnpm db:generate      # generates Prisma client (writes to .pnpm store + packages/db)
cp .env.example .env.local
pnpm dev              # starts Next.js at http://localhost:3000
```

That's it. The app boots without Postgres in dev mode (mock DB fallback kicks in). To use real Postgres:

1. Spin up Postgres locally: `docker compose up -d postgres` (compose file under `docker/`)
2. Set `DATABASE_URL` in `.env.local`
3. Set `FUSION_USE_MOCK_DB=0` in `.env.local`
4. `pnpm db:migrate` to apply the Prisma schema

---

## Project scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Starts Next.js with Turbopack on `:3000` |
| `pnpm build` | Production build (all packages built first via Turbo) |
| `pnpm lint` | ESLint across all packages |
| `pnpm type-check` | `tsc --noEmit` per package |
| `pnpm db:generate` | `prisma generate` → writes generated client into `.pnpm` |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:studio` | Prisma Studio GUI (defaults to :5555) |
| `pnpm format` | Prettier (with `prettier-plugin-organize-imports`) |

---

## Layout reminder

```
apps/web          → Next.js 15 app
packages/ai       → OpenAI helper modules
packages/auth     → Clerk wrappers + guards
packages/db       → Prisma schema + generated client
packages/queue    → BullMQ workers
packages/types    → Zod schemas & shared types
packages/ui       → shadcn/ui primitives
tooling/          → shared eslint/ts configs (future)
```

Conventions:

- New packages go under `packages/<name>/` with `"name": "@repo/<name>"`.
- Cross-package imports use `@repo/*` (pnpm workspace protocol).
- No direct imports across app boundaries — use the package's public API.

---

## Coding conventions

### TypeScript
- **Strict mode** everywhere. No `any`. Internal types are explicit.
- **Zod schemas** at the boundary (every tRPC input, every form, every external payload).
- **Inferred types** over declared types: `type T = z.infer<typeof schema>` rather than duplicate declarations.

### React
- **App Router by default.** Pages `app/<route>/page.tsx`, layouts co-located.
- **Server Components first**; only add `"use client"` when the component needs interactivity.
- **Smaller components, colocated.** If a component is only used by one page, drop it next to the page.

### tRPC / Server
- Every new mutation/query goes on a router file in `apps/web/server/routers/`.
- Prefer `protectedProcedure` unless it's intentionally public.
- Add `withDbFallback` pattern if your router uses Prisma and you want dev mode without Postgres.
- Errors: throw `TRPCError({ code, message })` — never raw `Error`.

### Styling
- `tailwindcss` v4 (PostCSS plugin autoloaded).
- Class merging: `cn()` from `packages/ui` (`clsx` + `tailwind-merge`).
- shadcn primitives in `packages/ui/src/*` — extend, don't fork.

### Database
- Schema lives in `packages/db/prisma/schema.prisma`.
- One model per file? — no, schema is single-file for now.
- Migrations: `pnpm db:migrate --name <change>`.

---

## Testing (currently light, planned expansion)

```bash
pnpm test            # vitest, unit (planned)
pnpm test:e2e        # playwright (planned)
```

Test files live next to source: `foo.ts` ↔ `foo.test.ts`.

---

## Git workflow

1. **Branch from `main`**: `git checkout -b feat/<short-slug>` or `fix/<short-slug>`
2. **Commits**: prefer Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). One logical change per commit.
3. **Before PR**: run `pnpm lint && pnpm type-check && pnpm build`.
4. **Open PR** against `main`. CI runs lint, type-check, build. Review required.
5. **Squash merge** once approved.

> Releases are cut from `main` via `pnpm changeset` (when changelog infra is added).

---

## Dev-server quirks (Windows)

- **Prisma query engine not found.** If you see `query_engine-windows.dll.node not found`, run `pnpm db:generate`. If the dev server is holding the DLL, stop it first (`Ctrl+C`) before re-generating.
- **Turbopack HMR occasionally stalls** on Windows when many files change at once — `Ctrl+C` + `pnpm dev`.
- **ms-playwright browser cache** is shared at `%LOCALAPPDATA%\ms-playwright`. Use `pnpm exec playwright install` once.

---

## Where to start

| If you want to… | Start at |
|---|---|
| Add a new page | `apps/web/app/(dashboard)/...` |
| Add a new entity | `packages/db/prisma/schema.prisma` → migrate → new router in `apps/web/server/routers/` |
| Add a new UI primitive | `packages/ui/src/<name>.tsx` |
| Wire a new AI tool | `packages/ai/src/tools/<name>.ts` |
| Wire a new async job | `packages/queue/src/jobs/<name>.ts` |

---

## Code of conduct

Be respectful, stay focused, ship working code. We're all busy.

---

## Questions?

Open an issue or ping in `#fusion-dev` on Discord.
