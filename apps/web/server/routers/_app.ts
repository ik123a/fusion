import { router } from "../trpc";
import { projectRouter } from "./project";
import { taskRouter } from "./task";
import { codeRouter } from "./code";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  project: projectRouter,
  task: taskRouter,
  code: codeRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
