"use client";

import { TRPCProvider } from "@/app/providers";
import { ProjectsContent } from "@/components/projects-content";

export default function ProjectsPage() {
  return (
    <TRPCProvider>
      <ProjectsContent />
    </TRPCProvider>
  );
}
