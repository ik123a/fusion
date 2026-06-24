"use client";

import { TRPCProvider } from "@/app/providers";
import { DashboardContent } from "@/components/dashboard-content";

export default function DashboardPage() {
  return (
    <TRPCProvider>
      <DashboardContent />
    </TRPCProvider>
  );
}
