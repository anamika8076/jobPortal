"use client";

import React from "react";
import { AppShell } from "@/components/shell/AppShell";
import { RecruiterDataProvider } from "@/context/RecruiterDataContext";
import { RECRUITER_SHELL } from "@/components/recruiter/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell config={RECRUITER_SHELL} allowedRoles={["recruiter"]}>
      <RecruiterDataProvider>{children}</RecruiterDataProvider>
    </AppShell>
  );
}
