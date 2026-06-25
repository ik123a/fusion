"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Search, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { CommandPalette } from "@/components/command-palette";

// Helper to format breadcrumb items
const formatPathname = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return ["Dashboard"];
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = formatPathname(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background mesh-gradient text-foreground">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/60 px-6 backdrop-blur-md">
            {/* Left side: Sidebar Trigger & Breadcrumbs */}
            <div className="flex items-center gap-4">
              <SidebarTrigger className="border-border/40 hover:bg-secondary/60 transition-colors" />
              <div className="h-4 w-px bg-border/40" />
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-medium">
                {breadcrumbs.map((crumb, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-muted-foreground/50">/</span>}
                    <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}>
                      {crumb}
                    </span>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right side: Search shortcut & Notifications */}
            <div className="flex items-center gap-3">
              {/* Search button placeholder */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/35 px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/65 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {/* Notification button */}
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 bg-secondary/35 hover:bg-secondary/65 transition-colors focus:outline-none">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
              </button>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
