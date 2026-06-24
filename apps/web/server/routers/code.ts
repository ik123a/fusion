import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const codeRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.db.codeFile.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          path: "asc",
        },
      });

      return files;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.codeFile.findUnique({
        where: { id: input.id },
      });

      if (!file) {
        throw new Error("File not found");
      }

      return file;
    }),

  create: protectedProcedure
    .input(
      z.object({
        path: z.string().min(1),
        content: z.string(),
        language: z.string(),
        projectId: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.codeFile.create({
        data: {
          path: input.path,
          content: input.content,
          language: input.language,
          projectId: input.projectId,
          workspaceId: input.workspaceId,
          createdById: ctx.userId,
        },
      });

      return file;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.codeFile.update({
        where: { id: input.id },
        data: {
          content: input.content,
          version: {
            increment: 1,
          },
        },
      });

      return file;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.codeFile.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
