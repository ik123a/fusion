import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaces = await ctx.db.workspaceUser.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                projects: true,
                users: true,
              },
            },
          },
        },
      },
    });

    return workspaces.map((wu) => ({
      ...wu.workspace,
      role: wu.role,
      projectCount: wu.workspace._count.projects,
      memberCount: wu.workspace._count.users,
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.id },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          projects: true,
        },
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      return workspace;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          users: {
            create: {
              userId: ctx.userId,
              role: "OWNER",
            },
          },
        },
      });

      return workspace;
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
      const workspace = await ctx.db.workspace.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });

      return workspace;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.workspace.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error("User not found with this email");
      }

      const membership = await ctx.db.workspaceUser.create({
        data: {
          workspaceId: input.workspaceId,
          userId: user.id,
          role: input.role || "MEMBER",
        },
      });

      return membership;
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.workspaceUser.deleteMany({
        where: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      });

      return { success: true };
    }),
});
