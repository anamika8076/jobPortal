"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/api";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { applicantCounts } from "@/lib/recruiterStats";
import { JobForm } from "@/components/JobForm";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { PageHeader } from "@/components/recruiter/DashboardUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, ExternalLink, Users } from "lucide-react";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);
  const { jobs, companies, applications, loading, error, refresh, setJobActive } = useRecruiterData();
  const [toggling, setToggling] = useState(false);

  if (loading) return <LoadingState label="Loading job..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const job = jobs.find((j) => j.job_id === jobId);
  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="It may have been deleted, or it was posted by another recruiter."
        action={
          <Link href="/dashboard/jobs">
            <Button variant="outline">Back to jobs</Button>
          </Link>
        }
      />
    );
  }

  const applicants = applicantCounts(applications)[job.job_id] ?? 0;

  const toggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await setJobActive(job.job_id, !job.is_active);
      toast.success(job.is_active ? "Job closed" : "Job reopened");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the job status"));
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        All jobs
      </Link>
      <PageHeader
        title={job.title}
        description={`${job.company_name} · ${applicants} applicant${applicants === 1 ? "" : "s"}`}
        actions={
          <>
            <Badge variant={job.is_active ? "success" : "secondary"} className="self-center">
              {job.is_active ? "Open" : "Closed"}
            </Badge>
            <Button variant="outline" size="sm" onClick={toggle} isLoading={toggling}>
              {job.is_active ? "Close job" : "Reopen job"}
            </Button>
            <Link href={`/dashboard/applicants?job=${job.job_id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users className="h-4 w-4" />
                Applicants
              </Button>
            </Link>
            <Link href={`/jobs/${job.job_id}`} target="_blank">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ExternalLink className="h-4 w-4" />
                Public page
              </Button>
            </Link>
          </>
        }
      />
      <JobForm
        key={job.job_id}
        companies={companies}
        job={job}
        onCancel={() => router.push("/dashboard/jobs")}
        onSaved={async () => {
          await refresh();
          router.push("/dashboard/jobs");
        }}
      />
    </>
  );
}
