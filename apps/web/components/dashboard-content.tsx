"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, FileCode, CheckSquare, Clock } from "lucide-react";

const mockProjects = [
  { id: "1", name: "Fusion Platform", taskCount: 12, description: "Unified dev environment" },
  { id: "2", name: "API Gateway", taskCount: 8, description: "Microservices gateway" },
  { id: "3", name: "Mobile App", taskCount: 5, description: "React Native mobile client" },
];

export function DashboardContent() {
  const { data: projects, isLoading, error } = trpc.project.list.useQuery();
  const useProjects = error ? mockProjects : projects;
  const totalProjects = useProjects?.length ?? 0;
  const totalTasks = useProjects?.reduce((acc: number, p: any) => acc + p.taskCount, 0) ?? 0;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalProjects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Files</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : useProjects && useProjects.length > 0 ? (
              <div className="space-y-2">
                {useProjects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex justify-between items-center p-2 rounded hover:bg-muted">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.taskCount} tasks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No projects yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with Fusion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/projects" className="block p-2 rounded hover:bg-muted">
              Create a new project
            </a>
            <a href="/editor" className="block p-2 rounded hover:bg-muted">
              Open code editor
            </a>
            <a href="/api" className="block p-2 rounded hover:bg-muted">
              Test an API endpoint
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
