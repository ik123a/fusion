"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CheckCircle,
  Clock,
  Rocket,
  ExternalLink,
  GitBranch,
  GitCommit,
  Terminal,
  XCircle,
  Loader2,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────
type DeploymentStatus = "success" | "failed" | "deploying" | "pending";
type Environment = "production" | "staging" | "development";

interface Deployment {
  id: string;
  name: string;
  status: DeploymentStatus;
  environment: Environment;
  url: string;
  createdAt: string;
  commitHash: string;
  duration: string;
  branch: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────
const deployments: Deployment[] = [
  {
    id: "dep-001",
    name: "fusion-web-production",
    status: "deploying",
    environment: "production",
    url: "https://fusion.app.example.com",
    createdAt: "2 minutes ago",
    commitHash: "a3f8c2d",
    duration: "1m 12s",
    branch: "main",
  },
  {
    id: "dep-002",
    name: "fusion-api-staging",
    status: "success",
    environment: "staging",
    url: "https://staging-api.fusion.app.example.com",
    createdAt: "34 minutes ago",
    commitHash: "e7b1f04",
    duration: "2m 45s",
    branch: "develop",
  },
  {
    id: "dep-003",
    name: "fusion-web-staging",
    status: "success",
    environment: "staging",
    url: "https://staging.fusion.app.example.com",
    createdAt: "1 hour ago",
    commitHash: "9c4d6a1",
    duration: "2m 18s",
    branch: "feature/auth-v2",
  },
  {
    id: "dep-004",
    name: "fusion-api-production",
    status: "failed",
    environment: "production",
    url: "https://api.fusion.app.example.com",
    createdAt: "3 hours ago",
    commitHash: "1b5e8f3",
    duration: "0m 48s",
    branch: "hotfix/rate-limit",
  },
  {
    id: "dep-005",
    name: "fusion-docs-dev",
    status: "pending",
    environment: "development",
    url: "https://dev-docs.fusion.app.example.com",
    createdAt: "5 hours ago",
    commitHash: "d2a7c90",
    duration: "—",
    branch: "docs/api-reference",
  },
];

// ── Status Config ────────────────────────────────────────────────────────
const statusConfig: Record<
  DeploymentStatus,
  {
    color: string;
    bgColor: string;
    ringColor: string;
    label: string;
    icon: React.ReactNode;
    animate: boolean;
  }
> = {
  success: {
    color: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    ringColor: "ring-emerald-500/30",
    label: "Success",
    icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    animate: false,
  },
  failed: {
    color: "bg-red-500",
    bgColor: "bg-red-500/10",
    ringColor: "ring-red-500/30",
    label: "Failed",
    icon: <XCircle className="h-4 w-4 text-red-400" />,
    animate: false,
  },
  deploying: {
    color: "bg-indigo-500",
    bgColor: "bg-indigo-500/10",
    ringColor: "ring-indigo-500/30",
    label: "Deploying",
    icon: <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />,
    animate: true,
  },
  pending: {
    color: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    ringColor: "ring-amber-500/30",
    label: "Pending",
    icon: <Timer className="h-4 w-4 text-amber-400" />,
    animate: true,
  },
};

const envConfig: Record<
  Environment,
  { className: string; label: string }
> = {
  production: {
    className:
      "bg-rose-500/15 text-rose-300 border-rose-500/20 hover:bg-rose-500/20",
    label: "Production",
  },
  staging: {
    className:
      "bg-amber-500/15 text-amber-300 border-amber-500/20 hover:bg-amber-500/20",
    label: "Staging",
  },
  development: {
    className:
      "bg-emerald-500/15 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20",
    label: "Development",
  },
};

// ── Animation Variants ───────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

// ── Stat Card Component ──────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="glass rounded-xl p-5 card-hover">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg",
              iconColor
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Status Dot Component ─────────────────────────────────────────────────
function StatusDot({ status }: { status: DeploymentStatus }) {
  const config = statusConfig[status];

  return (
    <span className="relative flex h-3 w-3">
      {config.animate && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            config.color
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-3 w-3 rounded-full",
          config.color
        )}
      />
    </span>
  );
}

// ── Deployment Card Component ────────────────────────────────────────────
function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const status = statusConfig[deployment.status];
  const env = envConfig[deployment.environment];

  return (
    <motion.div variants={itemVariants}>
      <div
        className={cn(
          "glass rounded-xl card-hover overflow-hidden",
          deployment.status === "deploying" && "glow-primary gradient-border"
        )}
      >
        {/* Active deployment shimmer bar */}
        {deployment.status === "deploying" && (
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />
        )}

        <div className="p-5">
          {/* Top Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Status + Info */}
            <div className="flex items-start gap-4">
              {/* Status indicator */}
              <div
                className={cn(
                  "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                  status.bgColor,
                  status.ringColor
                )}
              >
                {status.icon}
              </div>

              {/* Deployment info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold truncate">
                    {deployment.name}
                  </h3>
                  <Badge
                    className={cn(
                      "border text-[11px] font-medium",
                      env.className
                    )}
                  >
                    {env.label}
                  </Badge>
                  <Badge
                    className={cn(
                      "border text-[11px] font-medium",
                      status.bgColor,
                      deployment.status === "success" &&
                        "text-emerald-300 border-emerald-500/20",
                      deployment.status === "failed" &&
                        "text-red-300 border-red-500/20",
                      deployment.status === "deploying" &&
                        "text-indigo-300 border-indigo-500/20",
                      deployment.status === "pending" &&
                        "text-amber-300 border-amber-500/20"
                    )}
                  >
                    <StatusDot status={deployment.status} />
                    <span className="ml-1.5">{status.label}</span>
                  </Badge>
                </div>

                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-indigo-400 transition-colors truncate"
                >
                  {deployment.url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>

            {/* Right: Time + Actions */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {deployment.createdAt}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/50 hover:bg-secondary/80 hover:border-indigo-500/30 transition-all"
              >
                <Terminal className="h-3.5 w-3.5" />
                View Logs
              </Button>
            </div>
          </div>

          {/* Bottom Row: Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GitCommit className="h-3.5 w-3.5" />
              <code className="font-mono text-xs text-foreground/70">
                {deployment.commitHash}
              </code>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{deployment.branch}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{deployment.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function DeploymentsPage() {
  const totalDeployments = deployments.length;
  const successCount = deployments.filter(
    (d) => d.status === "success"
  ).length;
  const successRate =
    totalDeployments > 0
      ? Math.round((successCount / totalDeployments) * 100)
      : 0;

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Deployments
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and manage your application deployments
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30">
          <Rocket className="h-4 w-4" />
          New Deployment
        </Button>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Cloud className="h-5 w-5 text-indigo-400" />}
          iconColor="bg-indigo-500/15"
          label="Total Deployments"
          value={String(totalDeployments)}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
          iconColor="bg-emerald-500/15"
          label="Success Rate"
          value={`${successRate}%`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-cyan-400" />}
          iconColor="bg-cyan-500/15"
          label="Avg Deploy Time"
          value="2m 30s"
        />
      </div>

      {/* ── Deployment List ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <motion.h2
          variants={itemVariants}
          className="text-lg font-semibold text-foreground/90"
        >
          Recent Deployments
        </motion.h2>

        <div className="space-y-3">
          {deployments.map((deployment) => (
            <DeploymentCard key={deployment.id} deployment={deployment} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
