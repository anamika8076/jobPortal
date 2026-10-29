"use client";

import React, { useCallback, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RecruiterDataProvider } from "@/context/RecruiterDataContext";
import { Sidebar } from "@/components/recruiter/Sidebar";
import { Topbar } from "@/components/recruiter/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Backend routes enforce recruiter role and ownership too; this only gates the UI */}
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <RecruiterDataProvider>
          <a
            href="#dashboard-main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Skip to content
          </a>
          <Sidebar mobileOpen={mobileNavOpen} onClose={closeNav} />
          <div className="lg:pl-64 flex min-h-screen flex-col bg-muted/40">
            <Topbar onMenuClick={() => setMobileNavOpen(true)} />
            <main id="dashboard-main" className="flex-1 px-4 py-6 md:px-6 md:py-8 animate-fade-up">
              <div className="mx-auto max-w-7xl space-y-6">{children}</div>
            </main>
          </div>
        </RecruiterDataProvider>
      </ProtectedRoute>
    </div>
  );
}
