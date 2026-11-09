import { TRPCError } from "@trpc/server";
import type { Role } from "@repo/db";
import { isDemoMode } from "./auth-config";

export const editors: Role[] = ["OWNER", "ADMIN", "MEMBER"];
export const managers: Role[] = ["OWNER", "ADMIN"];

export function workspaceAccess(userId: string, roles?: Role[]) {
  return { users: { some: { userId, ...(roles && { role: { in: roles } }) } } };
}

export function taskWriteAccess(userId: string, assigneeId?: string | null) {
  const conditions = [workspaceAccess(userId, editors)];
  if (assigneeId) conditions.push(workspaceAccess(assigneeId));
  return { workspace: { AND: conditions } };
}

export function fileAccess(userId: string, roles?: Role[]) {
  const workspace = workspaceAccess(userId, roles);
  // Legacy files can reference a project and a workspace independently.
  return { workspace, project: { workspace } };
}

export function notFound() {
  return new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
}

export async function withData<Real, Demo>(real: () => Promise<Real>, demo: () => Demo) {
  if (isDemoMode()) return demo();
  try {
    return await real();
  } catch (error) {
    // Prisma uses these for missing records and unmatched relation connects.
    if (typeof error === "object" && error !== null && "code" in error
      && (error.code === "P2025" || error.code === "P2018")) {
      throw notFound();
    }
    throw error;
  }
}
