"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Clock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskBoardProps {
  projectId: string;
}

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  assignee?: { name: string; email: string };
}

const columns = [
  { id: "TODO", title: "To Do", dotColor: "bg-slate-400", bgClass: "bg-slate-500/5 border-slate-500/10" },
  { id: "IN_PROGRESS", title: "In Progress", dotColor: "bg-indigo-400 animate-pulse", bgClass: "bg-indigo-500/5 border-indigo-500/10" },
  { id: "REVIEW", title: "Review", dotColor: "bg-amber-400", bgClass: "bg-amber-500/5 border-amber-500/10" },
  { id: "DONE", title: "Done", dotColor: "bg-emerald-400", bgClass: "bg-emerald-500/5 border-emerald-500/10" },
];

const priorityConfig: Record<TaskPriority, { borderClass: string; badgeClass: string }> = {
  LOW: {
    borderClass: "border-l-slate-500/60",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  MEDIUM: {
    borderClass: "border-l-blue-500/60",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  HIGH: {
    borderClass: "border-l-amber-500/70",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  URGENT: {
    borderClass: "border-l-red-500 shadow-[inset_2px_0_10px_rgba(239,68,68,0.15)]",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse",
  },
};

const mockTasks: Task[] = [
  { id: "t-1", title: "Implement dark mode theme", description: "Design Tailwind core config and global mesh gradient assets.", status: "TODO", priority: "HIGH", createdAt: new Date().toISOString() },
  { id: "t-2", title: "Yjs Monaco collab pipeline", description: "Hook up WebRTC network provider for editor file state synchronizer.", status: "IN_PROGRESS", priority: "URGENT", createdAt: new Date().toISOString() },
  { id: "t-3", title: "Configure router schemas", description: "Setup workspace queries and validation using Zod.", status: "REVIEW", priority: "MEDIUM", createdAt: new Date().toISOString() },
  { id: "t-4", title: "Draft API client hooks", description: "Ensure context wraps sidebar components safely.", status: "DONE", priority: "LOW", createdAt: new Date().toISOString() },
];

export function TaskBoard({ projectId }: TaskBoardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  const utils = trpc.useContext();
  
  // Queries & Mutations
  const { data: tasks, isLoading, error } = trpc.task.list.useQuery({ projectId });
  const useTasks = error ? mockTasks : tasks?.map((t: any) => ({
    ...t,
    createdAt: t.createdAt ?? new Date().toISOString(),
  })) ?? mockTasks;

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate({ projectId });
      setIsCreating(false);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate({ projectId });
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    createTask.mutate({
      projectId,
      title,
      description,
      priority,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate({
      id: taskId,
      status: newStatus,
    });
  };

  // Group tasks by status
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id as TaskStatus] = useTasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-6">
      {/* Task Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground/90">Kanban Board</h2>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 shadow-md">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/40">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Assign a development task to the current project board</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Integrate custom font mappings"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary/35 border-border/40 focus:border-indigo-500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Context details, acceptance criteria, or code symbols..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/35 border-border/40 focus:border-indigo-500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                  <SelectTrigger className="bg-secondary/35 border-border/40">
                    <SelectValue placeholder="Select priority tier" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createTask.isPending} className="bg-indigo-600 hover:bg-indigo-500">
                {createTask.isPending ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Columns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {columns.map((col) => {
            const columnTasks = tasksByColumn[col.id as TaskStatus] || [];
            
            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-xl border p-4 min-h-[480px] ${col.bgClass}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className="font-bold text-sm text-foreground/90">{col.title}</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/60 text-muted-foreground text-[10px]">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3">
                  <AnimatePresence>
                    {columnTasks.map((task) => {
                      const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
                      
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className={`glass border-l-4 card-hover ${priority.borderClass}`}>
                            <CardContent className="p-4 space-y-3">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm text-foreground/90 line-clamp-2 leading-relaxed">
                                    {task.title}
                                  </h4>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Card Meta & Badges */}
                              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                <Badge className={`text-[9px] font-bold px-1.5 py-0.5 border ${priority.badgeClass}`}>
                                  {task.priority}
                                </Badge>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Task Card Status Controller Row */}
                              <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
                                {/* Assignee Avatar placeholder */}
                                <div className="flex items-center gap-1.5">
                                  <Avatar size="sm" fallback={task.assignee?.name.charAt(0) || "U"} className="h-5 w-5 bg-secondary/80 text-[10px]" />
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                                    {task.assignee?.name || "Unassigned"}
                                  </span>
                                </div>

                                {/* Shift buttons */}
                                <div className="flex items-center gap-1">
                                  {col.id !== "TODO" && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        const prevIdx = columns.findIndex((c) => c.id === col.id) - 1;
                                        handleStatusChange(task.id, columns[prevIdx].id as TaskStatus);
                                      }}
                                    >
                                      <ArrowLeft className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {col.id !== "DONE" && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        const nextIdx = columns.findIndex((c) => c.id === col.id) + 1;
                                        handleStatusChange(task.id, columns[nextIdx].id as TaskStatus);
                                      }}
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-border/30 rounded-lg p-6 bg-secondary/5">
                      <span className="text-xs text-muted-foreground">No tasks in this lane</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
