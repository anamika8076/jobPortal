"use client";

import React from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SEEKER_SHELL } from "@/components/seeker/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell config={SEEKER_SHELL} allowedRoles={["jobseeker"]}>
      {children}
    </AppShell>
  );
}
