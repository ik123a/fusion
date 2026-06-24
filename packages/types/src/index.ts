export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeId?: string;
  createdById: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  projectId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
