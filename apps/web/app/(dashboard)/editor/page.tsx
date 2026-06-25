"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Folder,
  FileCode,
  File,
  ChevronLeft,
  ChevronRight,
  Users,
  Terminal,
  Activity,
  Globe,
  Settings,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// Dynamically import the collaborative editor component
const CollaborativeEditor = dynamic(
  () => import("@/components/editor/collaborative-editor").then((mod) => mod.CollaborativeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground gap-2 bg-background">
        <Activity className="h-4 w-4 animate-spin text-indigo-400" />
        <span>Booting real-time workspace server...</span>
      </div>
    ),
  }
);

interface FileNode {
  path: string;
  name: string;
  type: "file" | "folder";
  content: string;
  language: string;
}

const mockFiles: FileNode[] = [
  {
    path: "src/index.ts",
    name: "index.ts",
    type: "file",
    language: "typescript",
    content: `// Fusion Platform Entry Point\nimport { createServer } from "./server";\nimport { logger } from "./utils/helpers";\n\nconst PORT = process.env.PORT || 3000;\n\nasync function main() {\n  logger("Starting Fusion server...");\n  const server = await createServer();\n  \n  server.listen(PORT, () => {\n    logger(\`Server running on http://localhost:\${PORT}\`);\n  });\n}\n\nmain().catch(console.error);\n`,
  },
  {
    path: "src/server.ts",
    name: "server.ts",
    type: "file",
    language: "typescript",
    content: `// Server module setup\nimport express from "express";\nimport cors from "cors";\nimport { trpcExpress } from "@trpc/server/adapters/express";\nimport { appRouter } from "./routers/_app";\n\nexport async function createServer() {\n  const app = express();\n  \n  app.use(cors());\n  app.use(express.json());\n  \n  // Bind tRPC route adapters\n  app.use("/trpc", trpcExpress.createExpressMiddleware({ router: appRouter }));\n  \n  return app;\n}\n`,
  },
  {
    path: "src/utils/helpers.ts",
    name: "helpers.ts",
    type: "file",
    language: "typescript",
    content: `// General utility helpers\nexport function logger(message: string): void {\n  const timestamp = new Date().toISOString();\n  console.log(\`[\${timestamp}] FUSION_IDE: \${message}\`);\n}\n\nexport function formatBytes(bytes: number, decimals = 2): string {\n  if (bytes === 0) return "0 Bytes";\n  const k = 1024;\n  const dm = decimals < 0 ? 0 : decimals;\n  const sizes = ["Bytes", "KB", "MB", "GB"];\n  const i = Math.floor(Math.log(bytes) / Math.log(k));\n  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];\n}\n`,
  },
];

export default function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<FileNode>(mockFiles[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#090b11] text-foreground select-none overflow-hidden">
      {/* Main Workspace Row */}
      <div className="flex flex-1 min-h-0">
        
        {/* Collapsible File Explorer Sidebar */}
        <div
          className={`flex flex-col border-r border-border/40 bg-[#0d0f17] transition-all duration-300 ${
            sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-60"
          }`}
        >
          {/* Explorer Header */}
          {!sidebarCollapsed && (
            <div className="flex h-10 items-center justify-between px-4 border-b border-border/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Explorer</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File Tree */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {/* Fake src folder structure */}
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground font-semibold">
                <Folder className="h-4 w-4 text-indigo-400/80" />
                <span>src</span>
              </div>

              {/* File Nodes */}
              <div className="pl-4 space-y-1">
                {mockFiles.map((file) => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-500/10 text-indigo-400 font-semibold border-l-2 border-indigo-500 rounded-l-none"
                          : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                      }`}
                    >
                      <FileCode className="h-4 w-4 text-cyan-400" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Expansion handle trigger if collapsed */}
        {sidebarCollapsed && (
          <div className="flex flex-col border-r border-border/40 bg-[#0d0f17] w-10 items-center py-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <CollaborativeEditor
              documentId={`editor-${selectedFile.path.replace(/\//g, "-")}`}
              initialContent={selectedFile.content}
              language={selectedFile.language}
              fileName={selectedFile.name}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 flex items-center justify-between border-t border-border/40 bg-[#0d0f17] px-4 text-[10px] text-muted-foreground select-none shrink-0 font-medium">
        {/* Left Side: Language details */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
            <FileCode className="h-3 w-3 text-indigo-400" />
            TypeScript ({selectedFile.language})
          </span>
          <span>Tab Size: 2</span>
          <span>UTF-8</span>
        </div>

        {/* Center: Connection State indicator */}
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ring-2 ${
            connectionStatus === "connected"
              ? "bg-emerald-500 ring-emerald-500/20"
              : connectionStatus === "connecting"
              ? "bg-amber-500 ring-amber-500/20 animate-pulse"
              : "bg-red-500 ring-red-500/20"
          }`} />
          <span className="capitalize text-foreground/80">Yjs WebRTC {connectionStatus}</span>
        </div>

        {/* Right Side: Peers */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>Collab: Active</span>
          </span>
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>IDE Guide</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
