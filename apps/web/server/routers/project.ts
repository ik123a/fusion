import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

import { withData, workspaceAccess, editors, notFound } from "../access";

const mockDb = {
  projects: [
    {
      id: "1",
      name: "Fusion Platform",
      description: "Unified dev environment",
      workspaceId: "ws1",
      createdAt: new Date("2026-06-20"),
      updatedAt: new Date("2026-06-24"),
      taskCount: 12,
    },
    {
      id: "2",
      name: "API Gateway",
      description: "Microservices gateway",
      workspaceId: "ws1",
      createdAt: new Date("2026-06-18"),
      updatedAt: new Date("2026-06-23"),
      taskCount: 8,
    },
    {
      id: "3",
      name: "Mobile App",
      description: "React Native mobile client",
      workspaceId: "ws1",
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

export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return withData(
      async () => {
        const projects = await ctx.db.project.findMany({
          where: { workspace: workspaceAccess(ctx.userId) },
          include: { _count: { select: { tasks: true } } },
          orderBy: { updatedAt: "desc" },
        });
        return projects.map((p) => ({
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
      return withData(
        async () => {
          const project = await ctx.db.project.findUnique({
            where: { id: input.id, workspace: workspaceAccess(ctx.userId) },
            include: {
              tasks: true,
              documents: { where: { workspace: workspaceAccess(ctx.userId) } },
              codeFiles: { where: { workspace: workspaceAccess(ctx.userId) } },
            },
          });
          if (!project) throw notFound();
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
      return withData(
        async () => {
          return await ctx.db.project.create({
            data: {
              name: input.name,
              description: input.description,
              workspace: { connect: { id: input.workspaceId, ...workspaceAccess(ctx.userId, editors) } },
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
      return withData(
        async () => {
          return await ctx.db.project.update({
            where: { id: input.id, workspace: workspaceAccess(ctx.userId, editors) },
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
      return withData(
        async () => {
          const scope = { id: input.id, workspace: workspaceAccess(ctx.userId, editors) };
          const project = await ctx.db.project.findUnique({
            where: scope,
            select: { workspaceId: true },
          });
          if (!project) throw notFound();
          const foreignChild = { workspaceId: { not: project.workspaceId } };
          // Keep pre-existing inconsistent rows out of the database cascade.
          await ctx.db.project.delete({
            where: {
              ...scope,
              workspaceId: project.workspaceId,
              documents: { none: foreignChild },
              codeFiles: { none: foreignChild },
            },
          });
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
