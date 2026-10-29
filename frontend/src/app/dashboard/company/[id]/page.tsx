"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { jobApi, getErrorMessage } from "@/lib/api";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { applicantCounts } from "@/lib/recruiterStats";
import { formatDate } from "@/lib/utils";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { PageHeader, SectionCard } from "@/components/shell/DashboardUI";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Briefcase, ExternalLink, PlusCircle, Trash2 } from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params?.id);
  const { companies, jobs, applications, loading, error, refresh } = useRecruiterData();
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingState label="Loading company..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const company = companies.find((c) => c.company_id === companyId);
  if (!company) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Company not found"
        description="It may have been deleted, or it belongs to another recruiter."
        action={
          <Link href="/dashboard/company">
            <Button variant="outline">Back to companies</Button>
          </Link>
        }
      />
    );
  }

  const companyJobs = jobs.filter((j) => j.company_id === companyId);
  const counts = applicantCounts(applications);

  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm(
      `Delete ${company.name}? This permanently removes its ${companyJobs.length} job(s) and all of their applications.`
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await jobApi.delete(`/company/delete/${company.company_id}`);
      toast.success("Company deleted");
      await refresh();
      router.push("/dashboard/company");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the company"));
      setDeleting(false);
    }
  };

  return (
    <>
      <Link href="/dashboard/company" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        All companies
      </Link>

      <Card className="overflow-hidden">
        <div className="h-20 bg-muted border-b border-border" />
        <div className="px-6 pb-6 -mt-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar src={company.logo} fallbackText={company.name} size="xl" className="h-20 w-20 rounded-2xl ring-4 ring-card" />
            <div className="space-y-1 pb-1">
              <h2 className="text-2xl font-extrabold">{company.name}</h2>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {company.website}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/post-job?company=${company.company_id}`}>
              <Button variant="brand" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                Post job
              </Button>
            </Link>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleDelete} isLoading={deleting}>
              {!deleting && <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{company.description}</p>
        </div>
      </Card>

      <PageHeader title={`Jobs at ${company.name}`} />
      <SectionCard title={`${companyJobs.length} job${companyJobs.length === 1 ? "" : "s"}`}>
        {companyJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs posted for this company yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {companyJobs.map((job) => (
              <li key={job.job_id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/dashboard/jobs/${job.job_id}`} className="font-semibold hover:text-primary">
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {job.location} · posted {formatDate(job.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/applicants?job=${job.job_id}`} className="text-xs font-medium text-primary hover:underline tabular-nums">
                    {counts[job.job_id] ?? 0} applicants
                  </Link>
                  <Badge variant={job.is_active ? "success" : "secondary"}>{job.is_active ? "Open" : "Closed"}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
