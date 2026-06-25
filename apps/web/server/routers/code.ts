import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const isDev = process.env.NODE_ENV !== "production";
const useMockDb = isDev && process.env.FUSION_USE_MOCK_DB !== "0";

const mockCodeFiles = [
  {
    id: "cf1",
    path: "src/index.ts",
    content: 'console.log("Hello, Fusion!");\n',
    language: "typescript",
    projectId: "1",
    workspaceId: "ws1",
    version: 1,
    createdById: "dev-user-001",
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date("2026-06-24"),
  },
  {
    id: "cf2",
    path: "src/server.ts",
    content: 'import express from "express";\n\nconst app = express();\napp.listen(3000);\n',
    language: "typescript",
    projectId: "1",
    workspaceId: "ws1",
    version: 2,
    createdById: "dev-user-001",
    createdAt: new Date("2026-06-18"),
    updatedAt: new Date("2026-06-22"),
  },
  {
    id: "cf3",
    path: "src/utils/helpers.ts",
    content: "export function formatDate(d: Date): string {\n  return d.toISOString();\n}\n",
    language: "typescript",
    projectId: "2",
    workspaceId: "ws1",
    version: 1,
    createdById: "dev-user-001",
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-20"),
  },
];

interface MockCodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  projectId: string;
  workspaceId: string;
  version: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

const mockCodeFileStore = [...mockCodeFiles] as MockCodeFile[];

async function withDbFallback<T>(real: () => Promise<T>, fallback: () => any): Promise<T> {
  if (!useMockDb) return real();
  try {
    return await real();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[code router] DB unavailable (${msg.split("\n")[0]}) — using mock data.`);
    }
    return fallback() as T;
  }
}

export const codeRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const files = await ctx.db.codeFile.findMany({
            where: { projectId: input.projectId },
            orderBy: { path: "asc" },
          });
          return files;
        },
        () => mockCodeFileStore.filter((f) => f.projectId === input.projectId)
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const file = await ctx.db.codeFile.findUnique({
            where: { id: input.id },
          });
          if (!file) throw new Error("File not found");
          return file;
        },
        () => {
          const file = mockCodeFileStore.find((f) => f.id === input.id);
          if (!file) throw new Error("File not found");
          return file;
        }
      );
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
      return withDbFallback(
        async () => {
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
        },
        () => {
          const newFile: MockCodeFile = {
            id: `cf${Date.now()}`,
            path: input.path,
            content: input.content,
            language: input.language,
            projectId: input.projectId,
            workspaceId: input.workspaceId,
            version: 1,
            createdById: ctx.userId ?? "dev-user-001",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockCodeFileStore.push(newFile);
          return newFile;
        }
      );
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const file = await ctx.db.codeFile.update({
            where: { id: input.id },
            data: { content: input.content, version: { increment: 1 } },
          });
          return file;
        },
        () => {
          const idx = mockCodeFileStore.findIndex((f) => f.id === input.id);
          if (idx === -1) throw new Error("File not found");
          const existing = mockCodeFileStore[idx];
          const updated = { ...existing, content: input.content, version: existing.version + 1, updatedAt: new Date() };
          mockCodeFileStore[idx] = updated;
          return updated;
        }
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          await ctx.db.codeFile.delete({ where: { id: input.id } });
          return { success: true };
        },
        () => {
          const idx = mockCodeFileStore.findIndex((f) => f.id === input.id);
          if (idx !== -1) mockCodeFileStore.splice(idx, 1);
          return { success: true };
        }
      );
    }),
});
