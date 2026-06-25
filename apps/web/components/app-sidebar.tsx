"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  FolderGit2,
  FileCode,
  Database,
  Rocket,
  Settings,
  Code2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { UserDropdown } from "@/components/user-dropdown";

const items = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Projects", icon: FolderGit2, url: "/projects" },
  { title: "Code Editor", icon: FileCode, url: "/editor" },
  { title: "API Playground", icon: Database, url: "/api" },
  { title: "Deployments", icon: Rocket, url: "/deployments" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur-md">
      {/* Sidebar Header with Fusion Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/10">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-wider gradient-text text-lg">Fusion</span>
        </Link>
      </div>

      <Separator className="border-border/30 mx-4 w-auto" />

      {/* Workspace Switcher */}
      <div className="px-3 py-4">
        <WorkspaceSwitcher />
      </div>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                // Check if current route matches (exact or prefix for subroutes)
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`relative flex items-center gap-3 px-3 py-5 rounded-lg font-medium text-sm transition-all duration-200 border border-transparent ${
                        isActive
                          ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <Link href={item.url} className="w-full h-full flex items-center gap-3">
                        <item.icon className={`h-4 w-4 transition-transform ${isActive ? "text-indigo-400" : "text-muted-foreground"}`} />
                        <span className="flex-1">{item.title}</span>

                        {/* Active item highlight bar */}
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 top-[20%] h-[60%] w-0.5 rounded bg-gradient-to-b from-indigo-500 to-violet-500"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom Dropdown */}
      <div className="mt-auto p-4 border-t border-border/30">
        <UserDropdown />
      </div>
    </Sidebar>
  );
}
