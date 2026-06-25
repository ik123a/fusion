import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

// Dev-mode mock factory. When the DB is unreachable (no Postgres / no migration)
// we fall back to in-memory data so the UI still renders. Active only when
// NODE_ENV !== "production". In production, errors propagate to the client.
const isDev = process.env.NODE_ENV !== "production";
const useMockDb = isDev && process.env.FUSION_USE_MOCK_DB !== "0";

const mockDb = {
  projects: [
    {
      id: "1",
      name: "Fusion Platform",
      description: "Unified dev environment",
      workspaceId: "default",
      createdAt: new Date("2026-06-20"),
      updatedAt: new Date("2026-06-24"),
      taskCount: 12,
    },
    {
      id: "2",
      name: "API Gateway",
      description: "Microservices gateway",
      workspaceId: "default",
      createdAt: new Date("2026-06-18"),
      updatedAt: new Date("2026-06-23"),
      taskCount: 8,
    },
    {
      id: "3",
      name: "Mobile App",
      description: "React Native mobile client",
      workspaceId: "default",
      createdAt: new Date("2026-06-15"),
      updatedAt: new Date("2026-06-22"),
      taskCount: 5,
    },
  ] as Array<{
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: Date;
    updatedAt: Date;
    taskCount: number;
  }>,
};

// Wrap a real-DB operation so dev runs gracefully without Postgres / Redis.
// In dev we suppress the noisy Prisma stack trace because the fallback is
// intentional — readable one-liner instead.
//
// The fallback type is parametrized loosely: tRPC's inference already produces
// a complex Prisma infershape, and a small `as any` at the fallback site is
// cleaner than re-declaring the full include shape.
type AnyFn = () => Promise<any> | any;
async function withDbFallback<T>(
  real: AnyFn,
  fallback: () => T
): Promise<T> {
  if (!useMockDb) return (await real()) as T;
  try {
    return (await real()) as T;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[project router] DB unavailable (${msg.split("\n")[0]}) — using mock data.`
      );
    }
    return fallback();
  }
}

export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return withDbFallback(
      async () => {
        const projects = await ctx.db.project.findMany({
          where: { workspaceId: "default" },
          include: { _count: { select: { tasks: true } } },
          orderBy: { updatedAt: "desc" },
        });
        return projects.map((p: { _count: { tasks: number } } & Record<string, unknown>) => ({
          ...p,
          taskCount: p._count.tasks,
        }));
      },
      () => mockDb.projects
    );
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const project = await ctx.db.project.findUnique({
            where: { id: input.id },
            include: { tasks: true, documents: true, codeFiles: true },
          });
          if (!project) throw new Error("Project not found");
          return project;
        },
        () => {
          const p = mockDb.projects.find((x) => x.id === input.id);
          if (!p) throw new Error("Project not found");
          return { ...p, tasks: [], documents: [], codeFiles: [] };
        }
      );
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          return await ctx.db.project.create({
            data: {
              name: input.name,
              description: input.description,
              workspaceId: input.workspaceId,
            },
          });
        },
        () => {
          const created = {
            id: `mock-${Date.now()}`,
            name: input.name,
            description: input.description ?? null,
            workspaceId: input.workspaceId,
            createdAt: new Date(),
            updatedAt: new Date(),
            taskCount: 0,
          };
          mockDb.projects.unshift(created);
          return created;
        }
      );
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          return await ctx.db.project.update({
            where: { id: input.id },
            data: { name: input.name, description: input.description },
          });
        },
        () => {
          const idx = mockDb.projects.findIndex((p) => p.id === input.id);
          if (idx === -1) throw new Error("Project not found");
          mockDb.projects[idx] = {
            ...mockDb.projects[idx],
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.description !== undefined
              ? { description: input.description }
              : {}),
            updatedAt: new Date(),
          };
          return mockDb.projects[idx];
        }
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          await ctx.db.project.delete({ where: { id: input.id } });
          return { success: true };
        },
        () => {
          const idx = mockDb.projects.findIndex((p) => p.id === input.id);
          if (idx !== -1) mockDb.projects.splice(idx, 1);
          return { success: true };
        }
      );
    }),
});
