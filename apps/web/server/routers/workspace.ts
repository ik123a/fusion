import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const isDev = process.env.NODE_ENV !== "production";
const useMockDb = isDev && process.env.FUSION_USE_MOCK_DB !== "0";

const mockWorkspaces = [
  {
    id: "ws1",
    name: "Personal",
    slug: "personal",
    description: "Personal workspace",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-24"),
    role: "OWNER" as const,
    projectCount: 2,
    memberCount: 1,
  },
  {
    id: "ws2",
    name: "Team Workspace",
    slug: "team",
    description: "Main team workspace",
    createdAt: new Date("2026-06-10"),
    updatedAt: new Date("2026-06-24"),
    role: "ADMIN" as const,
    projectCount: 3,
    memberCount: 5,
  },
];

interface MockWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  projectCount: number;
  memberCount: number;
}

const mockWorkspaceStore = [...mockWorkspaces] as MockWorkspace[];

async function withDbFallback<T>(real: () => Promise<T>, fallback: () => any): Promise<T> {
  if (!useMockDb) return real();
  try {
    return await real();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[workspace router] DB unavailable (${msg.split("\n")[0]}) — using mock data.`);
    }
    return fallback() as T;
  }
}

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return withDbFallback(
      async () => {
        const workspaces = await ctx.db.workspaceUser.findMany({
          where: { userId: ctx.userId },
          include: {
            workspace: {
              include: {
                _count: { select: { projects: true, users: true } },
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
      },
      () => mockWorkspaceStore
    );
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          const workspace = await ctx.db.workspace.findUnique({
            where: { id: input.id },
            include: {
              users: { include: { user: true } },
              projects: true,
            },
          });
          if (!workspace) throw new Error("Workspace not found");
          return workspace;
        },
        () => {
          const ws = mockWorkspaceStore.find((w) => w.id === input.id);
          if (!ws) throw new Error("Workspace not found");
          return ws;
        }
      );
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
      return withDbFallback(
        async () => {
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
        },
        () => {
          const newWs: MockWorkspace = {
            id: `ws${Date.now()}`,
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: "OWNER",
            projectCount: 0,
            memberCount: 1,
          };
          mockWorkspaceStore.push(newWs);
          return newWs;
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
          const workspace = await ctx.db.workspace.update({
            where: { id: input.id },
            data: { name: input.name, description: input.description },
          });
          return workspace;
        },
        () => {
          const idx = mockWorkspaceStore.findIndex((w) => w.id === input.id);
          if (idx === -1) throw new Error("Workspace not found");
          const existing = mockWorkspaceStore[idx];
          const updated = {
            ...existing,
            name: input.name ?? existing.name,
            description: input.description ?? existing.description,
            updatedAt: new Date(),
          };
          mockWorkspaceStore[idx] = updated;
          return updated;
        }
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          await ctx.db.workspace.delete({ where: { id: input.id } });
          return { success: true };
        },
        () => {
          const idx = mockWorkspaceStore.findIndex((w) => w.id === input.id);
          if (idx !== -1) mockWorkspaceStore.splice(idx, 1);
          return { success: true };
        }
      );
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return withDbFallback(
        async () => {
          // In a real implementation, this would look up the user by email
          // and create a WorkspaceUser entry
          return { success: true, message: "Invitation sent" };
        },
        () => ({ success: true, message: "Invitation sent (mock)" })
      );
    }),
});
