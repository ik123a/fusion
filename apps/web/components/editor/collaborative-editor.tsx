"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Users, Sparkles, X, FileCode } from "lucide-react";
import { toast } from "sonner";

interface CollaborativeEditorProps {
  documentId?: string;
  initialContent?: string;
  language?: string;
  onSave?: (content: string) => void;
  fileName?: string;
}

const COLLABORATOR_COLORS = [
  "bg-indigo-500 text-white border-indigo-500",
  "bg-emerald-500 text-white border-emerald-500",
  "bg-cyan-500 text-white border-cyan-500",
  "bg-amber-500 text-white border-amber-500",
];

const COLLABORATORS = [
  { initials: "AR", name: "Alex Rivera" },
  { initials: "SC", name: "Sarah Chen" },
  { initials: "MA", name: "Marcus Aurelius" },
];

export function CollaborativeEditor({
  documentId = "default-document",
  initialContent = "// Start coding here...\n",
  language = "typescript",
  onSave,
  fileName = "index.ts",
}: CollaborativeEditorProps) {
  const editorRef = useRef<any>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const [peers, setPeers] = useState<number>(1);
  const [isConnected, setIsConnected] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    const provider = new WebrtcProvider(documentId, yDoc);
    const yText = yDoc.getText("monaco");

    if (initialContent && yText.length === 0) {
      yText.insert(0, initialContent);
    }

    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    const awareness = provider.awareness;
    
    // Set client username in awareness
    awareness.setLocalStateField("user", {
      name: "User",
      color: "#6366f1",
    });

    awareness.on("change", () => {
      const states = Array.from(awareness.getStates().values());
      setPeers(states.length);
    });

    provider.on("synced", () => {
      setIsConnected(true);
    });

    return () => {
      binding.destroy();
      provider.destroy();
      yDoc.destroy();
    };
  };

  const handleSave = () => {
    if (editorRef.current && onSave) {
      onSave(editorRef.current.getValue());
      toast.success("Document saved successfully");
    }
  };

  return (
    <Card className="h-full border-0 rounded-none bg-[#090b11] flex flex-col flex-1 min-h-0">
      
      {/* Editor Premium Toolbar */}
      <div className="h-11 flex items-center justify-between border-b border-border/40 bg-[#0d0f17] px-4 shrink-0">
        
        {/* Active tab */}
        <div className="flex items-center gap-1 bg-[#090b11] border-t-2 border-t-indigo-500 border-r border-border/40 h-full px-3 text-xs font-semibold text-indigo-400">
          <FileCode className="h-3.5 w-3.5 text-cyan-400" />
          <span>{fileName}</span>
          <X className="h-3 w-3 ml-2 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3.5">
          {/* Peer avatars */}
          <div className="flex items-center gap-1.5 border-r border-border/40 pr-3.5">
            <div className="flex -space-x-1.5 overflow-hidden">
              {COLLABORATORS.slice(0, peers).map((c, idx) => (
                <div
                  key={c.initials}
                  title={c.name}
                  className={`flex h-5 w-5 items-center justify-center rounded-full border border-background text-[8px] font-bold ${
                    COLLABORATOR_COLORS[idx % COLLABORATOR_COLORS.length]
                  }`}
                >
                  {c.initials}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {peers} online
            </span>
          </div>

          {/* AI Helper Tool */}
          <Button
            size="sm"
            onClick={() => toast.info("Fusion AI Assistant module loading...")}
            className="h-7 gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold shadow-md shadow-indigo-500/10"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Companion</span>
          </Button>

          {/* Save Button */}
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="h-7 gap-1 border-border/40 hover:bg-secondary/40 text-xs font-semibold"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Container */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={initialContent}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            lineNumbers: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: "selection",
            tabSize: 2,
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            padding: { top: 12 },
          }}
        />
      </div>
    </Card>
  );
}
