"use client";

import { motion } from "framer-motion";
import { Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#090b11]">
      {/* Ambient background particles */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      
      {/* Glowing blur bubbles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Back to Home button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border/40 bg-secondary/35 hover:bg-secondary/65 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </button>
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-4">
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col items-center gap-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/10">
            <Code2 className="h-5 w-5 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-wider gradient-text">Fusion Workspaces</h2>
          <p className="text-xs text-muted-foreground">Collaborate in real-time, deploy in seconds</p>
        </motion.div>

        {/* Auth card wrap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full bg-[#0d0f17]/65 border border-border/30 rounded-2xl shadow-2xl backdrop-blur-md p-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
