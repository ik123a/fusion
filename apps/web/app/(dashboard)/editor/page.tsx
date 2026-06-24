"use client";

import dynamic from "next/dynamic";

const CollaborativeEditor = dynamic(
  () => import("@/components/editor/collaborative-editor").then((mod) => mod.CollaborativeEditor),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Loading editor...</div> }
);

export default function EditorPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <CollaborativeEditor
        documentId="main-editor"
        initialContent={`// Welcome to Fusion Code Editor
// Start collaborating with your team in real-time!

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`}
        language="typescript"
      />
    </div>
  );
}
