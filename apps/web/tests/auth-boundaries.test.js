import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const external = vi.hoisted(() => ({ db: undefined, session: undefined }));
vi.mock("@clerk/nextjs/server", () => ({ auth: () => external.session }));
vi.mock("@repo/db", () => ({ get db() { return external.db; } }));

import { appRouter } from "../server/routers/_app";

// Only Clerk and Prisma are replaced. The adapter, session mapping, tRPC
// middleware, routers and their query filters execute against two tenant fixtures.
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (value === undefined) return true;
    if (key === "AND") return value.every((part) => matches(row, part));
    if (key === "OR") return value.some((part) => matches(row, part));
    if (key === "not") return row !== value;
    if (key === "in") return value.includes(row);
    if (key === "some") return row.some((item) => matches(item, value));
    if (key === "none") return !row.some((item) => matches(item, value));
    return value && typeof value === "object"
      ? matches(row[key], value)
      : row[key] === value;
  });
}

function table(rows) {
  const select = (where) => rows.find((row) => matches(row, where));
  const requireRow = (where) => {
    const row = select(where);
    if (!row) throw Object.assign(new Error("Record not found"), { code: "P2025" });
    return row;
  };
  return {
    findMany: async ({ where }) => rows.filter((row) => matches(row, where)),
    findUnique: async ({ where, include }) => {
      const row = select(where);
      if (!row) return null;
      const result = { ...row };
      for (const [key, relation] of Object.entries(include ?? {})) {
        if (relation.where && Array.isArray(row[key])) {
          result[key] = row[key].filter((item) => matches(item, relation.where));
        }
      }
      return result;
    },
    findFirst: async ({ where }) => select(where) ?? null,
    update: async ({ where, data }) => Object.assign(requireRow(where), data),
    delete: async ({ where }) => {
      const row = requireRow(where);
      rows.splice(rows.indexOf(row), 1);
      return row;
    },
    requireRow,
  };
}

function fixtureDb(legacyKind) {
  const memberships = [
    { userId: "alice", workspaceId: "a", role: "OWNER" },
    { userId: "viewer", workspaceId: "a", role: "VIEWER" },
    { userId: "member", workspaceId: "a", role: "MEMBER" },
    { userId: "admin", workspaceId: "a", role: "ADMIN" },
    { userId: "bob", workspaceId: "b", role: "OWNER" },
  ];
  const workspaces = ["a", "b"].map((id) => ({
    id, users: memberships.filter((m) => m.workspaceId === id), _count: { projects: 1, users: 1 },
  }));
  const projects = workspaces.map((workspace) => ({
    id: "p-" + workspace.id, workspaceId: workspace.id, workspace, _count: { tasks: 1 },
  }));
  const tasks = projects.map((project) => ({ id: "t-" + project.workspaceId, projectId: project.id, project }));
  const files = projects.map((project) => ({
    id: "f-" + project.workspaceId, projectId: project.id, workspaceId: project.workspaceId,
    workspace: project.workspace, project,
  }));
  const documents = [];
  if (legacyKind) {
    (legacyKind === "codeFiles" ? files : documents).push({
      id: "legacy", projectId: "p-a", project: projects[0], workspaceId: "b", workspace: workspaces[1],
    });
  }
  for (const [relation, items] of [["codeFiles", files], ["documents", documents]]) {
    for (const project of projects) {
      project[relation] = items.filter((i) => i.projectId === project.id)
        .map((i) => ({ id: i.id, workspaceId: i.workspaceId, workspace: { users: i.workspace.users } }));
    }
    for (const workspace of workspaces) {
      workspace[relation] = items.filter((i) => i.workspaceId === workspace.id)
        .map((i) => ({ project: { workspaceId: i.project.workspaceId } }));
    }
  }
  for (const workspace of workspaces) {
    workspace.projects = projects.filter((p) => p.workspaceId === workspace.id)
      .map((p) => ({ codeFiles: p.codeFiles, documents: p.documents }));
  }
  const db = {
    user: table(memberships.map((m) => ({ id: m.userId, clerkId: "clerk-" + m.userId }))),
    workspaceUser: table(memberships.map((m) => ({ ...m, workspace: workspaces.find((w) => w.id === m.workspaceId) }))),
    workspace: table(workspaces), project: table(projects), task: table(tasks), codeFile: table(files),
  };
  // Model Prisma's checked relation connects (and the original unchecked foreign keys).
  for (const name of ["project", "task", "codeFile"]) {
    db[name].create = async ({ data }) => {
      for (const relation of ["workspace", "project", "assignee", "createdBy"]) {
        if (data[relation]?.connect) {
          (db[relation] ?? db.user).requireRow(data[relation].connect);
        }
      }
      return { id: "new", ...data };
    };
  }
  return db;
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("FUSION_USE_MOCK_DB", "0");
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_fixture");
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_fixture");
  external.db = fixtureDb();
  external.session = { userId: null };
});
afterEach(() => vi.unstubAllEnvs());

async function requestList(header) {
  const { GET } = await import("../app/api/trpc/[trpc]/route");
  return GET(new Request("http://localhost/api/trpc/workspace.list", {
    headers: header ? { "x-user-id": header } : {},
  }));
}

const caller = (userId) => appRouter.createCaller({ userId, db: external.db });

describe("request identity", () => {
  it("rejects a caller-supplied identity without a verified session", async () => {
    expect((await requestList("bob")).status).toBe(401);
  });
  it("uses the internal user mapped from Clerk even when the header names another user", async () => {
    external.session = { userId: "clerk-alice" };
    const response = await requestList("bob");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.data.json.map((ws) => ws.id)).toEqual(["a"]);
  });
  it("rejects an unmapped session", async () => {
    external.session = { userId: "unknown" };
    expect((await requestList("alice")).status).toBe(401);
  });
  it.each(["production", "development"])("requires configured auth in %s without demo opt-in", async (env) => {
    vi.stubEnv("NODE_ENV", env);
    vi.stubEnv("CLERK_SECRET_KEY", "");
    expect((await requestList("alice")).status).toBe(401);
  });
  it("ignores demo opt-in in production", async () => {
    vi.resetModules();
    vi.stubEnv("FUSION_USE_MOCK_DB", "1");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");
    expect((await requestList()).status).toBe(401);
  });
  it("propagates database errors in authenticated development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("FUSION_USE_MOCK_DB", "1");
    external.session = { userId: "clerk-alice" };
    vi.spyOn(external.db.workspaceUser, "findMany").mockRejectedValue(new Error("Test database unavailable"));
    expect((await requestList()).status).toBe(500);
  });
  it("uses only fixtures in explicitly enabled local demo mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("FUSION_USE_MOCK_DB", "1");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");
    const realRead = vi.spyOn(external.db.workspaceUser, "findMany");
    const response = await requestList("alice");
    expect(response.status).toBe(200);
    expect((await response.json()).result.data.json.map((ws) => ws.id)).toEqual(["ws1", "ws2"]);
    expect(realRead).not.toHaveBeenCalled();
  });
});

describe("workspace membership and roles", () => {
  it.each(["codeFiles", "documents"])("isolates legacy mismatched %s from reads and cascades", async (kind) => {
    external.db = fixtureDb(kind);
    const project = await caller("alice").project.getById({ id: "p-a" });
    expect(project[kind].map((r) => r.id)).not.toContain("legacy");
    if (kind === "codeFiles") {
      for (const user of ["alice", "bob"]) {
        await expect(caller(user).code.getById({ id: "legacy" })).rejects.toMatchObject({ code: "NOT_FOUND" });
      }
    }
    await expect(caller("alice").project.delete({ id: "p-a" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("alice").workspace.delete({ id: "a" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("bob").workspace.delete({ id: "b" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it.each([
    ["workspace", "b"], ["project", "p-b"], ["task", "t-b"], ["code", "f-b"],
  ])("denies cross-tenant %s reads and writes", async (resource, id) => {
    const api = caller("alice")[resource];
    await expect(api.getById({ id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(api.delete({ id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("scopes project and child-resource lists to the caller's workspace", async () => {
    expect((await caller("alice").project.list()).map((p) => p.id)).toEqual(["p-a"]);
    expect(await caller("alice").task.list({ projectId: "p-b" })).toEqual([]);
    expect(await caller("alice").code.list({ projectId: "p-b" })).toEqual([]);
  });
  it("allows viewers to read a project but denies writes", async () => {
    expect((await caller("viewer").project.getById({ id: "p-a" })).id).toBe("p-a");
    await expect(caller("viewer").project.update({ id: "p-a", name: "changed" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("viewer").task.update({ id: "t-a", title: "changed" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("viewer").code.update({ id: "f-a", content: "changed" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("allows admins to edit workspace metadata and reserves deletion for owners", async () => {
    await expect(caller("member").workspace.update({ id: "a", name: "denied" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await caller("admin").workspace.update({ id: "a", name: "updated" })).name).toBe("updated");
    await expect(caller("admin").workspace.delete({ id: "a" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await caller("alice").workspace.delete({ id: "a" })).toEqual({ success: true });
  });
  it("cannot create projects or tasks inside a foreign workspace", async () => {
    await expect(caller("alice").project.create({ name: "new", workspaceId: "b" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("alice").task.create({ title: "new", projectId: "p-b" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("rejects cross-workspace assignees on both task writes", async () => {
    await expect(caller("alice").task.create({ title: "new", projectId: "p-a", assigneeId: "bob" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("alice").task.update({ id: "t-a", assigneeId: "bob" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await caller("member").task.create({ title: "new", projectId: "p-a", assigneeId: "viewer" })).id).toBe("new");
  });
  it("checks both the project and workspace on code creation", async () => {
    const input = { projectId: "p-a", workspaceId: "b", path: "main.ts", content: "", language: "ts" };
    await expect(caller("alice").code.create(input)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await caller("member").code.create({ ...input, workspaceId: "a" })).id).toBe("new");
  });
  it("denies non-admin invitations and never reports an unimplemented send as successful", async () => {
    const input = { workspaceId: "a", email: "invitee@example.test", role: "MEMBER" };
    await expect(caller("bob").workspace.inviteMember(input)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller("alice").workspace.inviteMember(input)).rejects.toMatchObject({ code: "NOT_IMPLEMENTED" });
  });
});
