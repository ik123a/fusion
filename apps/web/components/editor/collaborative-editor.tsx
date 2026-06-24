"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Users } from "lucide-react";

interface CollaborativeEditorProps {
  documentId?: string;
  initialContent?: string;
  language?: string;
  onSave?: (content: string) => void;
}

export function CollaborativeEditor({
  documentId = "default-document",
  initialContent = "// Start coding here...\n",
  language = "typescript",
  onSave,
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
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );

    const awareness = provider.awareness;
    awareness.setLocalState({
      user: {
        name: "Current User",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      },
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
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Code Editor</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{peers} online</span>
          </div>
          {onSave && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={initialContent}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: "selection",
            tabSize: 2,
          }}
        />
      </CardContent>
    </Card>
  );
}
