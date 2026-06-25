"use client";

import { LogOut, Settings, User, Keyboard, ShieldAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";

export function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-secondary/40 text-left outline-none border border-transparent hover:border-border/30 transition-all cursor-pointer">
          {/* Avatar with gradient ring and online dot */}
          <div className="relative flex shrink-0">
            <Avatar
              size="sm"
              fallback="AR"
              className="h-8 w-8 ring-2 ring-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/20"
            />
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="truncate text-xs font-semibold text-foreground/90 leading-none mb-1">Alex Rivera</span>
            <span className="truncate text-[10px] text-muted-foreground leading-none">alex@fusion.dev</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 glass border-border/40" align="start" sideOffset={8}>
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-foreground">My Account</p>
            <p className="text-[10px] text-muted-foreground">Admin Access Granted</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="border-border/40" />
        
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/60">
          <Link href="/settings" className="flex w-full items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">Profile</span>
            <DropdownMenuShortcut className="text-[10px] opacity-50">⌘P</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/60">
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
            <DropdownMenuShortcut className="text-[10px] opacity-50">⌘,</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer focus:bg-secondary/60" onClick={() => toast.info("Shortcuts: press ⌘K to search, Ctrl+` to toggle terminal")}>
          <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">Shortcuts</span>
          <DropdownMenuShortcut className="text-[10px] opacity-50">?</DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="border-border/40" />
        
        <DropdownMenuItem 
          onClick={() => {
            toast.error("Sign out action simulated");
          }} 
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">Log out</span>
          <DropdownMenuShortcut className="text-[10px] opacity-50">⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
