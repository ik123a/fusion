import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const isDev = process.env.NODE_ENV !== "production";
const useMockDb = isDev && process.env.FUSION_USE_MOCK_DB !== "0";

const mockTasks = [
  {
    id: "t1",
    title: "Setup CI pipeline",
    description: "Configure GitHub Actions for automated testing",
    status: "DONE" as const,
    priority: "HIGH" as const,
    projectId: "1",
    assigneeId: null,
    createdById: "dev-user-001",
    dueDate: null,
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date("2026-06-24"),
    assignee: null,
    createdBy: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    _count: { subtasks: 2, comments: 1 },
    subtasks: [
      { id: "st1", title: "Write test workflow", completed: true, taskId: "t1", createdAt: new Date(), updatedAt: new Date() },
      { id: "st2", title: "Add build step", completed: true, taskId: "t1", createdAt: new Date(), updatedAt: new Date() },
    ],
    comments: [],
  },
  {
    id: "t2",
    title: "Design database schema",
    description: "Create the initial database schema for the platform",
    status: "IN_PROGRESS" as const,
    priority: "URGENT" as const,
    projectId: "1",
    assigneeId: "dev-user-001",
    createdById: "dev-user-001",
    dueDate: new Date("2026-06-30"),
    createdAt: new Date("2026-06-21"),
    updatedAt: new Date("2026-06-24"),
    assignee: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    createdBy: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    _count: { subtasks: 1, comments: 0 },
    subtasks: [],
    comments: [],
  },
  {
    id: "t3",
    title: "Implement authentication flow",
    description: "Add Clerk sign-in/sign-up pages",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    projectId: "1",
    assigneeId: null,
    createdById: "dev-user-001",
    dueDate: null,
    createdAt: new Date("2026-06-22"),
    updatedAt: new Date("2026-06-24"),
    assignee: null,
    createdBy: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    _count: { subtasks: 0, comments: 0 },
    subtasks: [],
    comments: [],
  },
  {
    id: "t4",
    title: "Build API playground",
    description: null,
    status: "REVIEW" as const,
    priority: "MEDIUM" as const,
    projectId: "2",
    assigneeId: "dev-user-001",
    createdById: "dev-user-001",
    dueDate: null,
    createdAt: new Date("2026-06-18"),
    updatedAt: new Date("2026-06-23"),
    assignee: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    createdBy: { id: "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
    _count: { subtasks: 0, comments: 2 },
    subtasks: [],
    comments: [],
  },
];

interface MockTask {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: { id: string; name: string; email: string; avatar: string | null } | null;
  createdBy: { id: string; name: string; email: string; avatar: string | null };
  _count: { subtasks: number; comments: number };
  subtasks: Array<{ id: string; title: string; completed: boolean; taskId: string; createdAt: Date; updatedAt: Date }>;
  comments: Array<Record<string, unknown>>;
}

const mockTaskStore = [...mockTasks] as MockTask[];

async function withDbFallback<T>(real: () => Promise<T>, fallback: () => any): Promise<T> {
  if (!useMockDb) return real();
  try {
    return await real();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[task router] DB unavailable (${msg.split("\n")[0]}) — using mock data.`);
    }
    return fallback() as T;
  }
}

export const taskRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const tasks = await ctx.db.task.findMany({
            where: { projectId: input.projectId },
            include: {
              assignee: true,
              createdBy: true,
              _count: { select: { subtasks: true, comments: true } },
            },
            orderBy: { createdAt: "desc" },
          });
          return tasks;
        },
        () => mockTaskStore.filter((t) => t.projectId === input.projectId)
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const task = await ctx.db.task.findUnique({
            where: { id: input.id },
            include: {
              assignee: true,
              createdBy: true,
              subtasks: true,
              comments: { include: { user: true } },
            },
          });
          if (!task) throw new Error("Task not found");
          return task;
        },
        () => {
          const task = mockTaskStore.find((t) => t.id === input.id);
          if (!task) throw new Error("Task not found");
          return task;
        }
      );
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectId: z.string(),
        assigneeId: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const task = await ctx.db.task.create({
            data: {
              title: input.title,
              description: input.description,
              projectId: input.projectId,
              createdById: ctx.userId,
              assigneeId: input.assigneeId,
              priority: input.priority,
              dueDate: input.dueDate,
            },
          });
          return task;
        },
        () => {
          const newTask: MockTask = {
            id: `t${Date.now()}`,
            title: input.title,
            description: input.description ?? null,
            status: "TODO",
            priority: input.priority ?? "MEDIUM",
            projectId: input.projectId,
            assigneeId: input.assigneeId ?? null,
            createdById: ctx.userId ?? "dev-user-001",
            dueDate: input.dueDate ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
            assignee: null,
            createdBy: { id: ctx.userId ?? "dev-user-001", name: "Dev User", email: "dev@fusion.io", avatar: null },
            _count: { subtasks: 0, comments: 0 },
            subtasks: [],
            comments: [],
          };
          mockTaskStore.push(newTask);
          return newTask;
        }
      );
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const task = await ctx.db.task.update({
            where: { id: input.id },
            data: {
              title: input.title,
              description: input.description,
              status: input.status,
              priority: input.priority,
              assigneeId: input.assigneeId,
              dueDate: input.dueDate,
            },
          });
          return task;
        },
        () => {
          const idx = mockTaskStore.findIndex((t) => t.id === input.id);
          if (idx === -1) throw new Error("Task not found");
          const existing = mockTaskStore[idx];
          const updated = {
            ...existing,
            title: input.title ?? existing.title,
            description: input.description ?? existing.description,
            status: input.status ?? existing.status,
            priority: input.priority ?? existing.priority,
            assigneeId: input.assigneeId !== undefined ? input.assigneeId : existing.assigneeId,
            dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
            updatedAt: new Date(),
          };
          mockTaskStore[idx] = updated;
          return updated;
        }
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          await ctx.db.task.delete({ where: { id: input.id } });
          return { success: true };
        },
        () => {
          const idx = mockTaskStore.findIndex((t) => t.id === input.id);
          if (idx !== -1) mockTaskStore.splice(idx, 1);
          return { success: true };
        }
      );
    }),
});
