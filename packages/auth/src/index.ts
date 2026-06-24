import { auth } from "@clerk/nextjs/server";
import { db } from "@repo/db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function getUserWorkspaces() {
  const user = await requireAuth();

  const workspaces = await db.workspaceUser.findMany({
    where: { userId: user.id },
    include: {
      workspace: true,
    },
  });

  return workspaces.map((wu) => wu.workspace);
}
