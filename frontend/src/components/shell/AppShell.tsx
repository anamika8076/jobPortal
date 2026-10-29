"use client";

import React, { useCallback, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserRole } from "@/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ShellConfig } from "./config";

// Signed-in area layout: sidebar, top bar and content. Backend routes enforce roles too; this only gates the UI.
export function AppShell({
  config,
  allowedRoles,
  children,
}: {
  config: ShellConfig;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProtectedRoute allowedRoles={allowedRoles}>
        <a
          href="#app-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <Sidebar config={config} mobileOpen={mobileNavOpen} onClose={closeNav} />
        <div className="lg:pl-64 flex min-h-screen flex-col bg-muted/40">
          <Topbar config={config} onMenuClick={() => setMobileNavOpen(true)} />
          <main id="app-main" className="flex-1 px-4 py-6 md:px-6 md:py-8 animate-fade-up">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    </div>
  );
}
