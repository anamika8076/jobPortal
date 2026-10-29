"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { JobForm } from "@/components/JobForm";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { PageHeader } from "@/components/shell/DashboardUI";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

function PostJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCompanyId = Number(searchParams.get("company")) || undefined;
  const { companies, loading, error, refresh } = useRecruiterData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Create a company first"
        description="Every job is posted under one of your companies."
        action={
          <Link href="/dashboard/company">
            <Button variant="brand">Create company</Button>
          </Link>
        }
      />
    );
  }

  return (
    <JobForm
      companies={companies}
      defaultCompanyId={defaultCompanyId}
      onSaved={async () => {
        await refresh();
        router.push("/dashboard/jobs");
      }}
    />
  );
}

export default function PostJobPage() {
  return (
    <>
      <PageHeader title="Post a Job" description="Published jobs appear immediately on the public jobs board." />
      <Suspense fallback={<LoadingState />}>
        <PostJobContent />
      </Suspense>
    </>
  );
}
