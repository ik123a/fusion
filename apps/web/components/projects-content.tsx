"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderGit2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  ArrowRight,
  FileCode,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// ── Mock Fallback Data ───────────────────────────────────────────────────
const mockProjects = [
  { id: "1", name: "Fusion Platform", description: "Real-time collaborative developer environment", taskCount: 12, completedCount: 8, fileCount: 45, color: "indigo", updatedAt: new Date().toISOString() },
  { id: "2", name: "API Gateway", description: "Microservices routing, rate limiting and OAuth", taskCount: 8, completedCount: 6, fileCount: 18, color: "cyan", updatedAt: new Date().toISOString() },
  { id: "3", name: "Mobile App", description: "React Native developer dashboard and client", taskCount: 5, completedCount: 1, fileCount: 22, color: "amber", updatedAt: new Date().toISOString() },
];

const colorPresets = [
  { name: "indigo", class: "bg-indigo-500 ring-indigo-500/35" },
  { name: "violet", class: "bg-violet-500 ring-violet-500/35" },
  { name: "cyan", class: "bg-cyan-500 ring-cyan-500/35" },
  { name: "emerald", class: "bg-emerald-500 ring-emerald-500/35" },
  { name: "amber", class: "bg-amber-500 ring-amber-500/35" },
];

const colorMap: Record<string, string> = {
  indigo: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10 shadow-indigo-500/5",
  violet: "border-violet-500/40 text-violet-400 bg-violet-500/10 shadow-violet-500/5",
  cyan: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/5",
  emerald: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/5",
  amber: "border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-amber-500/5",
};

export function ProjectsContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("indigo");

  const utils = trpc.useContext();
  const { data: projects, isLoading, error } = trpc.project.list.useQuery();
  const useProjects = error ? mockProjects : projects?.map((p: any, idx: number) => ({
    ...p,
    taskCount: p.taskCount ?? 10,
    completedCount: Math.round((p.taskCount ?? 10) * 0.6),
    fileCount: p.fileCount ?? 15,
    color: p.color ?? colorPresets[idx % colorPresets.length].name,
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  })) ?? mockProjects;

  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      setIsCreating(false);
      setName("");
      setDescription("");
      setSelectedColor("indigo");
      toast.success("Project created successfully");
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProject.mutate({
      name,
      description,
      workspaceId: "1",
    });
  };

  const filteredProjects = useProjects.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Projects</h1>
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-2 py-0.5">
              {filteredProjects.length}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">Manage and collaborate on your workspaces</p>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/15">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/40">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new workspace repository to collaborate in real-time</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Mobile Client App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/35 border-border/40 focus:border-indigo-500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe your workspace, goals and modules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/35 border-border/40 focus:border-indigo-500"
                />
              </div>

              {/* Color Preset Picker */}
              <div className="grid gap-1.5">
                <Label>Accent Color</Label>
                <div className="flex gap-3 pt-1">
                  {colorPresets.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-7 w-7 rounded-full border border-background/20 ring-offset-2 ring-offset-background transition-all ${c.class} ${
                        selectedColor === c.name ? "ring-2 scale-110" : "opacity-75 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={createProject.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Filter / View Toolbar ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/25 border-border/40 focus:border-indigo-500"
          />
        </div>

        <div className="flex rounded-lg border border-border/40 p-0.5 bg-secondary/15">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Projects View ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <Skeleton key={idx} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((p: any) => {
              const borderAccentClass = colorMap[p.color] || colorMap.indigo;
              const percentage = Math.round(((p.completedCount ?? 0) / (p.taskCount ?? 1)) * 100);

              if (viewMode === "grid") {
                return (
                  <motion.div
                    key={p.id}
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`glass rounded-xl p-5 card-hover flex flex-col justify-between h-56 relative group border-t-2 ${borderAccentClass}`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                          <FolderGit2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-base text-foreground/95 truncate group-hover:text-indigo-400 transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                        {p.description || "No description provided."}
                      </p>
                    </div>

                    <div className="space-y-3 mt-4">
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-muted-foreground">Task Progress</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} variant="gradient" size="sm" />
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between border-t border-border/30 pt-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3.5 w-3.5" /> {p.completedCount}/{p.taskCount} Tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <FileCode className="h-3.5 w-3.5" /> {p.fileCount} Files
                          </span>
                        </div>
                        <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 font-bold">
                          Open <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    key={p.id}
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-lg p-4 card-hover flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-2 border-t-0 border-indigo-500/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <FolderGit2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground/95 group-hover:text-indigo-400 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                          {p.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Small progress meter */}
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>Progress</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} variant="gradient" size="sm" />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" /> {p.taskCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCode className="h-3.5 w-3.5" /> {p.fileCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> 1d ago
                        </span>
                        <Link href={`/projects/${p.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 hover:bg-secondary/40 text-indigo-400 hover:text-indigo-300">
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="glass py-12">
          <CardContent className="text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/35 border border-border/40 mx-auto text-muted-foreground">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground/90">No projects found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try searching for a different name or tag." : "Create your first collaborative project workspace above."}
              </p>
            </div>
            {searchQuery && (
              <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-xs text-indigo-400">
                Clear search query
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
