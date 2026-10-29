"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { formatDate } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { PageHeader } from "@/components/recruiter/DashboardUI";
import { StatusActions } from "@/components/recruiter/StatusActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FileText, Search, Users } from "lucide-react";

const PAGE_SIZE = 10;

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const { jobs, applications, loading, error, refresh, profiles, loadProfiles } = useRecruiterData();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [jobFilter, setJobFilter] = useState(searchParams.get("job") ?? "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [page, setPage] = useState(1);

  // Keep filters in sync when the top-bar search or a job link changes the URL
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setJobFilter(searchParams.get("job") ?? "all");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    loadProfiles(applications.map((a) => a.applicant_id));
  }, [applications, loadProfiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => jobFilter === "all" || String(a.job_id) === jobFilter)
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) => {
        if (!q) return true;
        const profile = profiles[a.applicant_id];
        return (
          a.applicant_email.toLowerCase().includes(q) ||
          profile?.name.toLowerCase().includes(q) ||
          profile?.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.applied_at ?? 0).getTime() - new Date(a.applied_at ?? 0).getTime());
  }, [applications, profiles, query, jobFilter, statusFilter]);

  if (loading) return <LoadingState label="Loading applicants..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applicants yet"
        description="Applications to your jobs will appear here."
        action={
          <Link href="/dashboard/jobs">
            <Button variant="outline">Manage jobs</Button>
          </Link>
        }
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-border">
        <label className="relative flex-1">
          <span className="sr-only">Search by name, email or skill</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or skill..."
            className="pl-9"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[28rem]">
          <Select
            aria-label="Filter by job"
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All jobs</option>
            {jobs.map((j) => (
              <option key={j.job_id} value={j.job_id}>
                {j.title} · {j.company_name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">No applicants match these filters.</p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((app) => {
            const profile = profiles[app.applicant_id];
            return (
              <li key={app.application_id} className="p-4 md:px-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-accent/30 transition-colors">
                <div className="flex gap-3 min-w-0 flex-1">
                  <Avatar src={profile?.profile_pic} fallbackText={profile?.name || app.applicant_email} size="lg" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/applicants/${app.application_id}`} className="font-semibold hover:text-primary truncate">
                        {profile?.name || app.applicant_email}
                      </Link>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {app.job_title} · applied {formatDate(app.applied_at)}
                    </p>
                    {profile && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {profile.skills.slice(0, 5).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[11px]">
                            {s}
                          </Badge>
                        ))}
                        {profile.skills.length > 5 && (
                          <span className="text-[11px] text-muted-foreground self-center">+{profile.skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {app.resume && (
                    <a href={app.resume} target="_blank" rel="noreferrer noopener">
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <FileText className="h-4 w-4" />
                        Resume
                      </Button>
                    </a>
                  )}
                  <Link href={`/dashboard/applicants/${app.application_id}`}>
                    <Button variant="outline" size="sm">
                      View profile
                    </Button>
                  </Link>
                  <StatusActions application={app} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm" aria-label="Pagination">
          <span className="text-muted-foreground">
            {filtered.length} applicants · page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </nav>
      )}
    </Card>
  );
}

export default function ApplicantsPage() {
  return (
    <>
      <PageHeader title="Applicants" description="Everyone who has applied to your jobs. Candidates are emailed when their status changes." />
      <Suspense fallback={<LoadingState />}>
        <ApplicantsContent />
      </Suspense>
    </>
  );
}
