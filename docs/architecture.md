# Architecture

> **Fusion** — a real-time collaborative platform for product teams. Built as a TypeScript monorepo with full-stack type safety, end-to-end real-time collaboration (Yjs CRDTs), and a flexible API surface (tRPC).

---

## High-Level Overview

Fusion is a single Next.js app (`apps/web`) backed by a server-side tRPC router that talks to Postgres via Prisma. Real-time collaboration (editors, presence, multi-user cursors) uses Yjs over WebRTC for peer-to-peer sync, with the database acting as the durable source of truth for snapshots.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ React 19 SPA │  │ Monaco Editor│  │ Yjs Y.Doc    │  │ tRPC Client  │   │
│  │ + TanStack   │  │ + y-monaco   │  │ + y-webrtc   │  │ + superjson  │   │
│  │  Query       │  │   binding    │  │  (provider)  │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │           │
│         └─────────────────┴────────┬────────┴─────────────────┘           │
│                                    │                                      │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │           │              │
                          HTTPS / SSE│           │ WS / WSS     │ DB over TCP
                                     ▼           ▼              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         apps/web (Next.js 15)                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │ App Router (RSC + Client Components)                              │   │
│  │  - Auth-gated layouts (Clerk middleware)                          │   │
│  │  - API routes: /api/trpc/[trpc]                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │ server/routers/                                                   │   │
│  │  - workspace, project, task, code, ai                             │   │
│  │  - With mock-DB fallback for local dev (no Postgres required)     │   │
│  └───────────────┬───────────────────────────────────────────┬───────┘   │
│                  │                                           │           │
│       ┌──────────▼─────────┐  ┌──────────────┐  ┌────────────▼───────┐   │
│       │ packages/db (@repo)│  │ packages/ai  │  │ packages/queue     │   │
│       │ Prisma Client +    │  │ OpenAI client│  │ BullMQ + ioredis  │   │
│       │ generated client   │  │ + tool defs  │  │ for async jobs     │   │
│       └──────────┬─────────┘  └──────────────┘  └────────────┬───────┘   │
└──────────────────┼───────────────────────────────────────────┼───────────┘
                   │                                           │
                   ▼                                           ▼
        ┌──────────────────┐                       ┌──────────────────────┐
        │   PostgreSQL     │                       │   Redis (optional)   │
        │   (production)   │                       │   job queue backend  │
        └──────────────────┘                       └──────────────────────┘
```

---

## Monorepo Layout (Turbo + pnpm workspaces)

```
fusion/
├── apps/
│   └── web/                      # Next.js 15 app (the entire product frontend + API)
│       ├── app/                  # App Router: pages, layouts, RSC, [trpc] route handler
│       ├── components/           # Editor, sidebar, dashboard, ui primitives
│       ├── lib/                  # tRPC client, auth wrappers, utilities
│       ├── server/
│       │   ├── trpc.ts           # tRPC init: context, procedures, error formatter (with Zod)
│       │   └── routers/          # workspace, project, task, code, ai
│       └── styles/
│
├── packages/
│   ├── ai/         # OpenAI integration (assistant, completions, structured output)
│   ├── auth/       # Clerk helpers + auth utilities (server-side guards)
│   ├── db/         # Prisma schema + generated client
│   ├── queue/      # BullMQ job definitions + Redis-backed worker
│   ├── types/      # Shared TS types (Zod schemas, DTOs, enums)
│   └── ui/         # shadcn/ui-based primitives (Button, Card, Dialog, Tabs, erzeugnisförmig:)
│
├── tooling/        # (placeholder for eslint-config, ts-config packages)
├── docker/         # dev Postgres / compose stacks
├── docs/           # you are here (architecture.md, api.md, contributing.md)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Key Architectural Decisions (and why)

| Decision | Why |
|---|---|
| **Monorepo (pnpm + Turbo)** | Single repo for app + shared packages; pnpm hardlinks keep installs fast, Turbo caches builds. |
| **pnpm strict node_modules layout** | Workspace packages are pinned, not hoisted to root, preventing phantom-dep bugs. |
| **Next.js 15 App Router** | RSC for fast initial loads; route handlers instead of a separate API server; one process. |
| **tRPC over REST/REST-GraphQL** | End-to-end type safety without codegen; Zod gives runtime validation. Direct RPC from React Query. |
| **Prisma ORM** | Single schema source-of-truth; type-safe queries; easy migrations. |
| **Yjs + y-webrt**c | Real-time collaboration without a server. CRDTs guarantee convergence; y-webrtc is peer-to-peer so we avoid running a sync server in dev. |
| **y-monaco binding** | Editor state (text, cursors, selections, undo stack) syncs through Yjs automatically. The Monaco binding handles attaching Yjs awareness and undo manager. |
| **Clerk for auth** | Zero-config dev experience, drop-in middleware, multiple strategies out of the box (email, OAuth, passkeys). |
| **BullMQ (+ Redis) for queues** | Battle-tested, observable jobs for async work (AI requests, webhooks, exports). Mock fallback in dev so Redis is optional. |
| **Mock DB fallback (dev)** | tRPC routers auto-detect DB connection failure and serve fixture data. Lets you onboard without spinning up Postgres. Set `FUSION_USE_MOCK_DB=0` to bypass. |
| **superjson on tRPC** | Preserves Date, Map, Set, BigInt across the wire — Zod otherwise loses them. |

---

## Data Flow Examples

### A) User opens a project page

```
1. Browser navigates to /dashboard/projects/abc
2. RSC fetches session via Clerk (cached on the edge)
3. Client component mounts → useQuery(project.getById, { id: "abc" })
4. tRPC client POSTs to /api/trpc/[trpc]?batch=1
5. Route handler dispatches to project.getById
6. With DB available: Prisma SELECT → return
   Without DB: returns mock fallback, logged as warning
7. React Query caches; component renders
```

### B) Two users edit the same file

```
1. User A mounts Yjs Doc, opens y-webrtc provider with room name = `${workspaceId}:${projectId}:${path}`
2. User B in the same room joins via signaling server (public Yjs default)
3. y-monaco binding binds each user's Monaco instance to the shared Y.Doc
4. Characters typed by A generate Yjs ops; y-webrtc broadcasts to peers
5. CRDT convergence: B sees A's text within ~50ms with no server roundtrip
6. Periodic autosave (cron later) snapshots Y.Doc back to CodeFile.content
```

### C) AI suggestion flow

```
1. User clicks "Ask AI" in the editor
2. Client posts to tRPC ai.suggestCode mutation
3. Mutation enqueues a BullMQ job (or calls OpenAI directly if no Redis)
4. Worker calls OpenAI with current file content + selection
5. Result streamed back via SSE OR returned as final message
6. Client inserts the result as an editor "ghost text" suggestion
```

---

## Boundaries & Cross-cutting Concerns

- **Type safety:** tRPC gives client-server inference; Prisma gives DB inference. The `packages/types` package holds DTOs used by multiple packages.
- **Validation:** All tRPC inputs and mutations validated with Zod. Errors surface with structured `TRPCError` codes (`UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`).
- **Auth boundaries:** `protectedProcedure` enforces session guard inside every router. tRPC enables per-procedure authz rules. RSC layouts use Clerk `auth()` for server-side checks.
- **Error reporting:** tRPC's `errorFormatter` includes Zod issues flattened, so client-side forms can map field errors without parsing strings.
- **Logging:** Structured console output on server (`console.warn` in dev fallbacks, ergonomic to swap for pino later).

---

## Production Considerations

- Replace local y-webrtc with a hosted **y-websocket** server (Hocuspocus, Liveblocks) for scaling beyond ~10 peers per room.
- Move from mock DB fallback → Postgres in production (set `FUSION_USE_MOCK_DB=0`).
- Add observability: POST `/api/trpc` traces to OpenTelemetry, BullMQ jobs to a job dashboard.
- Add per-workspace rate limiting on AI mutations.
- Resolve `lucide-react` peer (currently React 19, lucide wants 16-18 — works in practice, upgrade when lucide ships v1).

See `docs/api.md` for the tRPC surface, and `docs/contributing.md` for local setup.
