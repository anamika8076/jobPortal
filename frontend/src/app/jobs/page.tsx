"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/StatusViews";
import { JobBoard } from "@/components/JobBoard";
import { Briefcase } from "lucide-react";

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isRecruiter = user?.role === "recruiter";

  // Recruiters manage their own postings instead of browsing the board
  useEffect(() => {
    if (isRecruiter) router.replace("/dashboard/jobs");
  }, [isRecruiter, router]);

  if (isRecruiter) return <LoadingState />;

  return (
    <div className="container py-10 md:py-16 space-y-8">
      <div className="space-y-3">
        <Badge variant="info" className="gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          Job Marketplace
        </Badge>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Explore Open Opportunities
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Browse every active role posted by recruiters on Hirely.
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <JobBoard />
      </Suspense>
    </div>
  );
}
