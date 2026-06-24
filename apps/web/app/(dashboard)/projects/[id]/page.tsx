"use client";

import { use } from "react";
import { TRPCProvider } from "@/app/providers";
import { ProjectDetailContent } from "@/components/project-detail-content";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <TRPCProvider>
      <ProjectDetailContent projectId={id} />
    </TRPCProvider>
  );
}
