"use client";

import React, { Suspense } from "react";
import { JobBoard } from "@/components/JobBoard";
import { LoadingState } from "@/components/StatusViews";
import { PageHeader } from "@/components/shell/DashboardUI";

export default function AccountJobsPage() {
  return (
    <>
      <PageHeader title="Find Jobs" description="Every open role on Hirely. Search by title or location." />
      <Suspense fallback={<LoadingState />}>
        <JobBoard detailBasePath="/account/jobs" />
      </Suspense>
    </>
  );
}
