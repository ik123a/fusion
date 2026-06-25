"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderGit2,
  FileCode,
  CheckSquare,
  Users,
  Clock,
  ArrowRight,
  Plus,
  Compass,
  Zap,
  Terminal,
  MessageSquare,
  GitCommit,
} from "lucide-react";
import Link from "next/link";

// ── Mock Activity ────────────────────────────────────────────────────────
const mockActivities = [
  { id: "act-1", type: "commit", text: "Alex Rivera pushed commit a3f8c2d to main", time: "10m ago", icon: GitCommit, color: "text-indigo-400 bg-indigo-500/10" },
  { id: "act-2", type: "task", text: "Sarah Chen completed task 'API rate limiting'", time: "45m ago", icon: CheckSquare, color: "text-emerald-400 bg-emerald-500/10" },
  { id: "act-3", type: "comment", text: "Marcus Aurelius commented on 'Auth Flow revamp'", time: "2h ago", icon: MessageSquare, color: "text-cyan-400 bg-cyan-500/10" },
];

const mockProjects = [
  { id: "1", name: "Fusion Platform", taskCount: 12, completedCount: 8, description: "Real-time collaborative developer environment", color: "from-indigo-500 to-violet-500", updatedAt: new Date().toISOString() },
  { id: "2", name: "API Gateway", taskCount: 8, completedCount: 6, description: "Microservices routing and auth gateway", color: "from-cyan-500 to-blue-500", updatedAt: new Date().toISOString() },
  { id: "3", name: "Mobile App", taskCount: 5, completedCount: 1, description: "React Native mobile workspace client", color: "from-amber-500 to-rose-500", updatedAt: new Date().toISOString() },
];

// ── Time-based greeting helper ───────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// ── Framer Motion Stagger Config ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export function DashboardContent() {
  const { data: projects, isLoading, error } = trpc.project.list.useQuery();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const useProjects = error ? mockProjects : projects?.map((p: any, idx: number) => ({
    ...p,
    // Inject mock completion metrics for nice UI bars
    taskCount: p.taskCount ?? 10,
    completedCount: Math.round((p.taskCount ?? 10) * 0.6),
    color: idx % 3 === 0 ? "from-indigo-500 to-violet-500" : idx % 3 === 1 ? "from-cyan-500 to-blue-500" : "from-amber-500 to-rose-500",
  })) ?? mockProjects;

  const totalProjects = useProjects?.length ?? 0;
  const totalTasks = useProjects?.reduce((acc: number, p: any) => acc + (p.taskCount ?? 0), 0) ?? 0;
  const activeTasks = useProjects?.reduce((acc: number, p: any) => acc + ((p.taskCount ?? 0) - (p.completedCount ?? 0)), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Skeleton className="h-96 rounded-xl md:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Greeting Header ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          {greeting}, User
        </h1>
        <p className="text-muted-foreground text-sm">
          Here is what is happening with your workspaces and projects today.
        </p>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Projects */}
        <div className="glass rounded-xl p-5 card-hover relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-indigo-500/10 to-violet-500/0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Projects</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{totalProjects}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="font-semibold">+12%</span>
            <span className="text-muted-foreground">since last week</span>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="glass rounded-xl p-5 card-hover relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-violet-500/10 to-purple-500/0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Tasks</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{activeTasks}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="font-semibold">+4%</span>
            <span className="text-muted-foreground">tasks resolved today</span>
          </div>
        </div>

        {/* Code Files */}
        <div className="glass rounded-xl p-5 card-hover relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-cyan-500/10 to-blue-500/0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Code Files</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">342</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400">
            <span className="font-semibold">+24</span>
            <span className="text-muted-foreground">modules written</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass rounded-xl p-5 card-hover relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-amber-500/10 to-rose-500/0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Team Members</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">8</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400">
            <span className="font-semibold">3</span>
            <span className="text-muted-foreground">peers active now</span>
          </div>
        </div>
      </motion.div>

      {/* ── Main Dashboard Split ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Recent Projects */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground/90">Recent Projects</h2>
            <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              View All Projects
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {useProjects.slice(0, 4).map((p: any) => {
              const percentage = Math.round(((p.completedCount ?? 0) / (p.taskCount ?? 1)) * 100);
              return (
                <div key={p.id} className="glass rounded-xl p-5 card-hover flex flex-col justify-between h-44 relative group">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.color}`} />
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-foreground/90 group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                      <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded font-semibold text-muted-foreground border border-border/40">
                        {p.taskCount} Tasks
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {p.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} variant="gradient" size="sm" />
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated 1d ago</span>
                      <Link href={`/projects/${p.id}`} className="text-indigo-400 hover:underline">Open Project</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column: Timeline Activity & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground/90">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/projects" className="glass rounded-lg p-3 hover:bg-secondary/40 border border-border/40 hover:border-indigo-500/20 text-center flex flex-col items-center gap-1.5 transition-all group">
                <Plus className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">New Project</span>
              </Link>
              <Link href="/editor" className="glass rounded-lg p-3 hover:bg-secondary/40 border border-border/40 hover:border-indigo-500/20 text-center flex flex-col items-center gap-1.5 transition-all group">
                <Terminal className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Open IDE</span>
              </Link>
              <Link href="/api" className="glass rounded-lg p-3 hover:bg-secondary/40 border border-border/40 hover:border-indigo-500/20 text-center flex flex-col items-center gap-1.5 transition-all group">
                <Compass className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Playground</span>
              </Link>
              <Link href="/deployments" className="glass rounded-lg p-3 hover:bg-secondary/40 border border-border/40 hover:border-indigo-500/20 text-center flex flex-col items-center gap-1.5 transition-all group">
                <Zap className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Deployments</span>
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground/90">Workspace Activity</h2>
            <div className="glass rounded-xl p-4 space-y-4">
              {mockActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 items-start relative group">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/30 ${act.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {act.text}
                      </p>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
