"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  FolderGit2,
  FileCode,
  Database,
  Rocket,
  Settings,
  Plus,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";

interface CommandItem {
  title: string;
  icon: any;
  category: "Navigation" | "Quick Actions" | "Recent";
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navigation Group
    { title: "Go to Dashboard", icon: Home, category: "Navigation", shortcut: "G D", action: () => { router.push("/dashboard"); setIsOpen(false); } },
    { title: "Browse Projects", icon: FolderGit2, category: "Navigation", shortcut: "G P", action: () => { router.push("/projects"); setIsOpen(false); } },
    { title: "Open Collaborative Editor", icon: FileCode, category: "Navigation", shortcut: "G E", action: () => { router.push("/editor"); setIsOpen(false); } },
    { title: "API Endpoint Playground", icon: Database, category: "Navigation", shortcut: "G A", action: () => { router.push("/api"); setIsOpen(false); } },
    { title: "Monitor Deployments", icon: Rocket, category: "Navigation", shortcut: "G L", action: () => { router.push("/deployments"); setIsOpen(false); } },
    { title: "Manage Workspace Settings", icon: Settings, category: "Navigation", shortcut: "G S", action: () => { router.push("/settings"); setIsOpen(false); } },
    
    // Quick Actions Group
    { title: "Create New Project Workspace", icon: Plus, category: "Quick Actions", shortcut: "⌥ N", action: () => { router.push("/projects"); setIsOpen(false); } },
    { title: "Trigger Cloud Deployment", icon: Rocket, category: "Quick Actions", shortcut: "⌥ D", action: () => { router.push("/deployments"); setIsOpen(false); } },
    { title: "Toggle Editor Sidebar", icon: Terminal, category: "Quick Actions", action: () => { router.push("/editor"); setIsOpen(false); } },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle arrow key select inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  // Close when clicking overlay backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Listen to custom custom-open event dispatched by header clicks
  useEffect(() => {
    const handleOpenCommandPalette = () => setIsOpen(true);
    window.addEventListener("open-command-palette", handleOpenCommandPalette);
    return () => window.removeEventListener("open-command-palette", handleOpenCommandPalette);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] px-4 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border/40 bg-[#0d0f17]/95 shadow-2xl backdrop-blur-md"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/30">
              <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a workspace command or search routes..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-medium"
              />
              <kbd className="pointer-events-none inline-flex select-none items-center gap-0.5 rounded border border-border/50 bg-secondary/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-2">
              {filtered.length > 0 ? (
                // Group by category
                ["Navigation", "Quick Actions"].map((category) => {
                  const items = filtered.filter((c) => c.category === category);
                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {category}
                      </div>
                      
                      {items.map((cmd) => {
                        // Find the index of this item in the global filtered list to match selectedIndex
                        const globalIdx = filtered.findIndex((c) => c.title === cmd.title);
                        const isSelected = globalIdx === selectedIndex;
                        const Icon = cmd.icon;

                        return (
                          <button
                            key={cmd.title}
                            onClick={cmd.action}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-indigo-500/10 text-indigo-400 glow-primary border-l-2 border-indigo-500 rounded-l-none"
                                : "text-muted-foreground hover:bg-secondary/35 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-muted-foreground"}`} />
                              <span>{cmd.title}</span>
                            </div>
                            
                            {cmd.shortcut && (
                              <span className="font-mono text-[10px] text-muted-foreground/50 bg-secondary/30 px-1.5 py-0.5 rounded border border-border/20">
                                {cmd.shortcut}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No workspace commands found matching "{search}"
                </div>
              )}
            </div>
            
            {/* Palette Footer Help Bar */}
            <div className="flex h-9 items-center justify-between border-t border-border/30 bg-secondary/10 px-4 text-[10px] text-muted-foreground/50">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-indigo-400" /> Fusion Command Engine</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
