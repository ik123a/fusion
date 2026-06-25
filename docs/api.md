# API Reference (tRPC)

> The Fusion API is exposed exclusively via **tRPC v11** at `/api/trpc/[trpc]`. All procedures are typed end-to-end (client ↔ server via `superjson`). Inputs are validated with **Zod**; errors are returned as `TRPCError`.

---

## Bootstrap

```ts
// Client
import { trpc } from "~/lib/trpc/client";

const { data } = trpc.project.list.useQuery({ workspaceId: "ws_1" });
```

```ts
// Server (route handler at /api/trpc/[trpc]/route.ts)
// — already wired by the scaffold.
```

---

## Routers

### `workspace.*`

#### `workspace.list`
- **Type:** query
- **Auth:** protected
- **Input:** none
- **Returns:** `Workspace[]` — all workspaces the current user belongs to, with `role`, `projectCount`, `memberCount`.

#### `workspace.getById`
- **Type:** query
- **Auth:** protected
- **Input:** `{ id: string }`
- **Returns:** `Workspace & { users: WorkspaceUser[]; projects: Project[] }`
- **Errors:** `NOT_FOUND` if workspace missing.

#### `workspace.create`
- **Type:** mutation
- **Auth:** protected
- **Input:**
  ```ts
  { name: string; slug: string /* lowercase, hyphenated */; description?: string }
  ```
- **Returns:** `Workspace`
- **Side effects:** assigns creator `OWNER` via `WorkspaceUser`.

#### `workspace.update`
- **Type:** mutation
- **Auth:** protected
- **Input:** `{ id: string; name?: string; description?: string }`
- **Errors:** `NOT_FOUND`.

#### `workspace.delete`
- **Type:** mutation
- **Auth:** protected (must be OWNER)
- **Input:** `{ id: string }`
- **Side effects:** cascades to projects, tasks, files (Prisma schema-level).

#### `workspace.inviteMember`
- **Type:** mutation
- **Auth:** protected (ADMIN+)
- **Input:** `{ workspaceId: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER" }`
- **Returns:** `{ success: true; message: string }`
- **Note:** Currently returns `success` immediately; future iteration will email-an Einladung or create a pending invite.

---

### `project.*`

#### `project.list`
- **Type:** query
- **Auth:** protected
- **Input:** `{ workspaceId?: string }` (omit for "all workspaces")
- **Returns:** `Project[]` with `owner`, `_count.tasks`, `_count.codeFiles`.

#### `project.getById`
- **Type:** query
- **Input:** `{ id: string }`
- **Returns:** full project including recent tasks and code files.

#### `project.create`
- **Input:**
  ```ts
  {
    name: string; description?: string;
    workspaceId: string;
    visibility?: "PRIVATE" | "TEAM" | "PUBLIC";
    color?: string; icon?: string;
  }
  ```
- **Returns:** `Project`. Creator becomes `owner`.

#### `project.update`
- **Input:** partial subset of create + status.
- **Returns:** updated `Project`.

#### `project.delete`
- **Input:** `{ id: string }`. Only owner or workspace admin can delete.
- **Side effects:** cascading delete of tasks, code files, comments, activity.

---

### `task.*`

#### `task.list`
- **Input:** `{ projectId: string }`
- **Returns:** `Task[]` ordered by `createdAt DESC`, with `assignee`, `createdBy`, counts.

#### `task.getById`
- **Input:** `{ id: string }`
- **Returns:** `Task` with `assignee`, `createdBy`, `subtasks`, `comments[]` (with `user`).

#### `task.create`
- **Input:**
  ```ts
  {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: Date;
  }
  ```
- **Auto:** `createdById = ctx.userId`. Status defaults to `TODO`.

#### `task.update`
- **Input:** any subset of `title`, `description`, `status`, `priority`, `assigneeId`, `dueDate`.
- **Errors:** `NOT_FOUND`.

#### `task.delete`
- **Input:** `{ id: string }`. Cascades to subtasks & comments.

#### Filter/derive helpers (planned)
- `task.byStatus`, `task.byAssignee`, `task.overdue` — backed by Prisma aggregations.

---

### `code.*`

#### `code.list`
- **Input:** `{ projectId: string }`
- **Returns:** `CodeFile[]` sorted by `path ASC`.

#### `code.getById`
- **Input:** `{ id: string }`
- **Returns:** `CodeFile` with full content + `version`.

#### `code.create`
- **Input:**
  ```ts
  {
    path: string;
    content: string;
    language: string;
    projectId: string;
    workspaceId: string;
  }
  ```
- **Auto:** `createdById = ctx.userId`, `version = 1`.

#### `code.update`
- **Input:** `{ id: string; content: string }`
- **Returns:** updated `CodeFile` with incremented `version`.
- **Use:** snapshot of Yjs Y.Doc onto `CodeFile.content`.

#### `code.delete`
- **Input:** `{ id: string }`. Soft-delete is planned (add `archivedAt`).

---

### `ai.*`

#### `ai.suggestCode`
- **Input:**
  ```ts
  { fileId: string; selection?: { start: number; end: number }; prompt: string }
  ```
- **Returns:** `{ suggestion: string; explanation?: string }`
- **Backend:** `packages/ai` → OpenAI Chat Completions with the current file as system context.

#### `ai.explainCode`
- **Input:** `{ fileId: string; selection?: { start: number; end: number } }`
- **Returns:** `{ explanation: string }` — doc-grade written explanation.

#### `ai.generateDocstring`
- **Input:** `{ fileId: string; selection?: { start: number; end: number }; style?: "tsdoc" | "jsdoc" | "google" }`
- **Returns:** `{ docstring: string }`

#### `ai.reviewCode`
- **Input:** `{ fileId: string; selection?: { start: number; end: number } }`
- **Returns:** `{ issues: CodeIssue[]; score: number }`

> All `ai.*` mutations enforce per-user rate limits (in-flight token bucket, defaults 60 req/min).

---

## Conventions

- **Auth:** every procedure on a router inherits `protectedProcedure` (Clerk session required).
- **Errors:** structured `TRPCError(code, message)` with field-level Zod issues in `data.zodError`.
- **Dates:** serialized via `superjson` — `Date` round-trips as Date.
- **Pagination:** `take`/`skip` + cursor helpers (not yet exposed).
- **Subscriptions:** not yet wired; will be added via WebSocket transport for real-time presence & task updates.

---

## Python/curl example

While `superjson` makes this slightly tricky from generic HTTP clients, here's a raw example using `trpc` batch URL:

```bash
curl 'http://localhost:3000/api/trpc/project.list?batch=1&input={"0":{"json":{"workspaceId":"ws1"}}}' \
  -H 'content-type: application/json'
```

In dev mode without auth you can bypass by setting `FUSION_DEV_BYPASS_AUTH=1` (see contributing.md).
