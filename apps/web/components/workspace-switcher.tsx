"use client";

import { useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const workspaces = [
  { id: "1", name: "Personal Workspace", plan: "Free", gradient: "from-indigo-500 to-violet-500" },
  { id: "2", name: "Fusion Team", plan: "Pro", gradient: "from-cyan-500 to-blue-500" },
  { id: "3", name: "Side Projects", plan: "Free", gradient: "from-amber-500 to-rose-500" },
];

export function WorkspaceSwitcher() {
  const [selected, setSelected] = useState(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 px-2 py-6 hover:bg-secondary/40 focus-visible:ring-1 focus-visible:ring-ring border border-transparent hover:border-border/30 rounded-lg transition-all"
        >
          {/* Workspace Avatar */}
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${selected.gradient} text-xs font-bold text-white shadow-sm`}>
            {selected.name.charAt(0)}
          </div>
          
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="truncate text-sm font-semibold text-foreground/90 leading-none mb-1">{selected.name}</span>
            <span className="text-[10px] text-muted-foreground leading-none">{selected.plan} Account</span>
          </div>
          
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 glass border-border/40" align="start" sideOffset={8}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-3 py-2">Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-border/40" />
        
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setSelected(ws)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-indigo-500/10 focus:bg-indigo-500/10 hover:text-indigo-400 focus:text-indigo-400 cursor-pointer"
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br ${ws.gradient} text-[10px] font-bold text-white shadow-sm`}>
              {ws.name.charAt(0)}
            </div>
            <span className="font-medium text-sm truncate flex-1">{ws.name}</span>
            
            {/* Plan Badge */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              ws.plan === "Pro" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "bg-secondary/60 text-muted-foreground border border-border/40"
            }`}>
              {ws.plan}
            </span>

            {/* Check */}
            {selected.id === ws.id && (
              <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="border-border/40" />
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/40 cursor-pointer text-muted-foreground hover:text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-border/60 bg-transparent text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
