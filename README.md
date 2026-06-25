# Fusion

> **Real-time collaborative platform for product teams.** TypeScript monorepo · Next.js 15 · tRPC · Prisma · Yjs CRDTs · Clerk auth.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Node 20+](https://img.shields.io/badge/node-%E2%89%A520-green.svg)](https://nodejs.org) [![pnpm 9+](https://img.shields.io/badge/pnpm-%E2%89%A59-orange.svg)](https://pnpm.io)

---

## Highlights

- ✅ **Real-time collaboration:** Yjs + y-monaco + y-webrtc — peer-to-peer CRDTs, no sync server in dev.
- ✅ **End-to-end type safety:** tRPC v11 + Zod + superjson. Client knows server types at compile time.
- ✅ **Single Next.js 15 app:** no separate API server, route handlers cover all RPC.
- ✅ **Mock DB fallback:** dev mode works without Postgres — routers auto-fall back to fixtures.
- ✅ **AI-native:** OpenAI codebase-aware suggestions, docstring gen, code review.
- ✅ **Auth out of the box:** Clerk middleware handles sign-in/sign-up/passkeys.
- ✅ **shadcn/ui primitives** in `packages/ui`, ready to extend.

---

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm db:generate
pnpm dev
```

Open <http://localhost:3000>. Skip Postgres setup entirely in dev — the tRPC routers serve fixtures when the DB is unreachable (set `FUSION_USE_MOCK_DB=0` to force real queries).

For full local setup — Postgres, Redis, Clerk, OpenAI keys — see **[`docs/contributing.md`](docs/contributing.md)**.

---

## Repository structure

```
fusion/
├── apps/web             → Next.js 15 app (UI + API)
├── packages/
│   ├── ai               → OpenAI integration
│   ├── auth             → Clerk helpers
│   ├── db               → Prisma schema + client
│   ├── queue            → BullMQ workers (Redis)
│   ├── types            → Shared Zod schemas & DTOs
│   └── ui               → shadcn/ui primitives
├── docker/              → Postgres + Redis compose
├── docs/                → architecture.md, api.md, contributing.md
└── turbo.json           → build orchestration
```

See **[`docs/architecture.md`](docs/architecture.md)** for the full system diagram, decisions, and reasoning.

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind 4 |
| Editor | Monaco + y-monaco (Yjs binding) |
| Realtime | Yjs over y-webrtc (no server in dev) |
| API | tRPC v11 + superjson |
| Validation | Zod |
| Auth | Clerk |
| ORM / DB | Prisma + PostgreSQL |
| Async jobs | BullMQ + Redis |
| AI | OpenAI (`@repo/ai`) |
| UI kit | shadcn/ui in `@repo/ui` |

---

## Scripts

```bash
pnpm dev              # next dev with Turbopack
pnpm build            # production build (turbo)
pnpm lint
pnpm type-check
pnpm db:generate      # prisma generate
pnpm db:migrate       # prisma migrate dev
pnpm db:studio        # prisma studio (default :5555)
```

---

## Status

**Active development.** The scaffold has a real database schema, full tRPC router surface, real-time collaboration, and an AI integration plan. See `docs/` for the roadmap.

---

## License

MIT.
