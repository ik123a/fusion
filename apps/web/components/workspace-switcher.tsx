"use client";

import { useState } from "react";
import { ChevronDown, Plus, Building2, Check } from "lucide-react";
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
  { id: "1", name: "Personal", plan: "Free" },
  { id: "2", name: "Team Workspace", plan: "Pro" },
  { id: "3", name: "Side Projects", plan: "Free" },
];

export function WorkspaceSwitcher() {
  const [selected, setSelected] = useState(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{selected.name}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setSelected(ws)}
            className="gap-2"
          >
            <Check
              className={`h-4 w-4 ${selected.id === ws.id ? "opacity-100" : "opacity-0"}`}
            />
            <span>{ws.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">{ws.plan}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
