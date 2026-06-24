"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TaskBoard } from "@/components/task-board";
import { CollaborativeEditor } from "@/components/editor/collaborative-editor";
import { ArrowLeft, Settings, Users, FileCode } from "lucide-react";
import Link from "next/link";

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const { data: project, isLoading } = trpc.project.getById.useQuery({ id: projectId });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="api">API Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <TaskBoard projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="code">
          <CollaborativeEditor
            documentId={`project-${projectId}`}
            initialContent={`// Welcome to ${project.name}\n// Start coding here...\n`}
            language="typescript"
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Project documentation and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No documents yet. Create your first document!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Requests</CardTitle>
              <CardDescription>Saved API requests for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No saved requests. Go to the API Playground to create some!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
