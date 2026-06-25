"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TaskBoard } from "@/components/task-board";
import {
  ArrowLeft,
  Settings,
  CheckSquare,
  FileCode,
  FileText,
  Globe,
  Loader2,
  AlertCircle,
  Clock,
  Code,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the collaborative Monaco editor wrapper
const CollaborativeEditor = dynamic(
  () => import("@/components/editor/collaborative-editor").then((mod) => mod.CollaborativeEditor),
  {
    ssr: false,
    loading: () => (
      <Card className="glass h-[500px]">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span>Configuring collaborative editor environment...</span>
        </div>
      </Card>
    ),
  }
);

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const { data: project, isLoading, error } = trpc.project.getById.useQuery({ id: projectId });
  const [activeTab, setActiveTab] = useState("tasks");

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-sm text-muted-foreground">Loading workspace details...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <Card className="glass border-destructive/20 text-center p-6 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle>Workspace Not Found</CardTitle>
            <CardDescription>
              We couldn't locate a workspace with ID "{projectId}". It might have been deleted.
            </CardDescription>
          </div>
          <Link href="/projects" className="inline-block">
            <Button className="bg-indigo-600 hover:bg-indigo-500">Back to Projects</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb Back Navigation ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* ── Project Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-secondary/15 border border-border/30 rounded-xl p-6 backdrop-blur-md">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">{project.name}</h1>
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2 py-0.5">
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            {project.description || "Collaborative environment with tasks, documentation, and live editor capabilities."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/40 hover:bg-secondary/40">
            <Settings className="h-4 w-4" />
            Project Settings
          </Button>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border/30 pb-0.5">
          <TabsList className="bg-secondary/15 border border-border/30 rounded-lg p-0.5">
            <TabsTrigger value="tasks" className="gap-1.5 px-4 py-2">
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1.5 px-4 py-2">
              <FileCode className="h-4 w-4" />
              <span>Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 px-4 py-2">
              <FileText className="h-4 w-4" />
              <span>Docs</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-1.5 px-4 py-2">
              <Globe className="h-4 w-4" />
              <span>API Playground</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab Content Panes ────────────────────────────────────────── */}
        
        {/* Tasks (Kanban) */}
        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
          <TaskBoard projectId={projectId} />
        </TabsContent>

        {/* Code Editor */}
        <TabsContent value="code" className="mt-0 focus-visible:outline-none">
          <div className="h-[600px] border border-border/30 rounded-xl overflow-hidden shadow-lg">
            <CollaborativeEditor
              documentId={`project-${projectId}`}
              initialContent={`// Welcome to ${project.name} Workspace\n// Code is synced in real-time between all participants.\n\nfunction initWorkspace() {\n  console.log("Workspace initialized");\n}\n\ninitWorkspace();\n`}
              language="typescript"
              fileName="index.ts"
            />
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" /> Documents
              </CardTitle>
              <CardDescription>Knowledge base articles and notes related to {project.name}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/35 border border-border/40 mx-auto text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground/90">No documents yet</p>
                <p className="text-xs text-muted-foreground">Create knowledge base articles to log specifications and APIs.</p>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">Create Document</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Playground */}
        <TabsContent value="api" className="mt-0 focus-visible:outline-none">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" /> Saved API Requests
              </CardTitle>
              <CardDescription>Test suites and REST endpoint playbooks</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/35 border border-border/40 mx-auto text-muted-foreground">
                <Globe className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground/90">No saved endpoint configurations</p>
                <p className="text-xs text-muted-foreground">Save your requests in the global API Playground to see them here.</p>
              </div>
              <Link href="/api">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 gap-1">
                  Go to API Playground
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
