"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  FolderGit2,
  FileCode,
  Globe,
  Rocket,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  GitBranch,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileCode,
    title: "Collaborative Editor",
    description: "Real-time code editing with Monaco, Yjs CRDTs, and multi-cursor support. No sync server needed.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: FolderGit2,
    title: "Project Management",
    description: "Kanban boards, task tracking, and team workspaces with full CRUD and real-time updates.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "API Playground",
    description: "Test and debug APIs with an intuitive Postman-like interface. Save requests per project.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Rocket,
    title: "Deployments",
    description: "Deploy your applications with infrastructure visualization and real-time status monitoring.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "AI-Native",
    description: "OpenAI-powered code suggestions, docstring generation, code review, and explanations.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Clerk authentication with passkeys, OAuth, and fine-grained workspace permissions.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { label: "Type-Safe APIs", value: "100%", icon: Zap },
  { label: "Real-time Sync", value: "<50ms", icon: GitBranch },
  { label: "Zero Config", value: "Dev Mode", icon: Code2 },
  { label: "Team Ready", value: "Built-in", icon: Users },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 mesh-gradient" />
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(238_83%_67%/0.12),transparent_70%)] blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(270_76%_60%/0.08),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Fusion</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-lg shadow-indigo-500/20">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Now with AI-powered code suggestions</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Your Unified
          <br />
          <span className="gradient-text">Development Environment</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
        >
          Project management, collaborative code editing, API testing, and deployment
          monitoring — all in one real-time platform built for modern product teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-xl shadow-indigo-500/25 h-12 px-8 text-base">
              Open Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/editor">
            <Button size="lg" variant="outline" className="glass h-12 px-8 text-base border-white/10 hover:bg-white/5">
              <FileCode className="mr-2 h-5 w-5" />
              Try the Editor
            </Button>
          </Link>
        </motion.div>

        {/* Terminal Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 w-full max-w-3xl"
        >
          <div className="glass-strong rounded-xl overflow-hidden shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">~/fusion</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-muted-foreground">
                <span className="text-emerald-400">$</span> pnpm dev
              </div>
              <div className="text-muted-foreground mt-2">
                <span className="text-cyan-400">▲ Next.js 15.0</span> — Turbopack ready
              </div>
              <div className="mt-1 text-muted-foreground">
                <span className="text-muted-foreground/60">-</span> Local: <span className="text-indigo-400">http://localhost:3000</span>
              </div>
              <div className="mt-1 text-muted-foreground">
                <span className="text-muted-foreground/60">-</span> tRPC: <span className="text-violet-400">4 routers</span> · <span className="text-amber-400">mock DB active</span>
              </div>
              <div className="mt-1 text-muted-foreground">
                <span className="text-muted-foreground/60">-</span> Yjs: <span className="text-emerald-400">WebRTC P2P</span> ready
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-foreground">Ready in <span className="text-indigo-400 font-semibold">340ms</span></span>
                <span className="inline-block w-2 h-4 bg-foreground/80 animate-pulse-soft" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="glass rounded-xl p-5 text-center card-hover"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need, <span className="gradient-text">in one place</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with the modern TypeScript stack. End-to-end type safety, real-time collaboration, and AI-powered development.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="glass rounded-xl p-6 card-hover group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-2xl p-10 sm:p-14 text-center gradient-border"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">fuse</span> your workflow?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            No Postgres, no Redis, no external services needed. Just clone, install, and start building.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-xl shadow-indigo-500/25 h-12 px-8 text-base">
                Launch Fusion
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-muted-foreground">Fusion — MIT Licensed</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
            <a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
