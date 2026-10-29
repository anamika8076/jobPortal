"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { applicantCounts } from "@/lib/recruiterStats";
import { JOB_TYPES } from "@/types";
import { workLocationLabel } from "@/components/JobForm";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { PageHeader } from "@/components/recruiter/DashboardUI";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Briefcase, ExternalLink, Pencil, PlusCircle, Search, Users } from "lucide-react";

const PAGE_SIZE = 10;
type StatusFilter = "all" | "open" | "closed";

export default function ManageJobsPage() {
  const { jobs, applications, loading, error, refresh, setJobActive } = useRecruiterData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [jobType, setJobType] = useState("all");
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const counts = useMemo(() => applicantCounts(applications), [applications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => !q || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q))
      .filter((j) => status === "all" || (status === "open" ? j.is_active : !j.is_active))
      .filter((j) => jobType === "all" || j.job_type === jobType)
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
  }, [jobs, query, status, jobType]);

  if (loading) return <LoadingState label="Loading jobs..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggle = async (jobId: number, isActive: boolean) => {
    if (togglingId !== null) return;
    setTogglingId(jobId);
    try {
      await setJobActive(jobId, !isActive);
      toast.success(isActive ? "Job closed" : "Job reopened");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the job status"));
    } finally {
      setTogglingId(null);
    }
  };

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Manage Jobs"
        description="Every job across your companies. Closed jobs stop accepting applications."
        actions={
          <Link href="/dashboard/post-job">
            <Button variant="brand" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Post your first job to start receiving applications."
          action={
            <Link href="/dashboard/post-job">
              <Button variant="brand">Post a Job</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
            <label className="relative flex-1">
              <span className="sr-only">Search jobs</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title, location or company..."
                className="pl-9"
                value={query}
                onChange={(e) => resetPage(setQuery)(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 md:w-80">
              <Select aria-label="Filter by status" value={status} onChange={(e) => resetPage(setStatus)(e.target.value as StatusFilter)}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
              <Select aria-label="Filter by employment type" value={jobType} onChange={(e) => resetPage(setJobType)(e.target.value)}>
                <option value="all">All types</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No jobs match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Job title</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Posted</th>
                    <th className="px-4 py-3 font-medium text-right">Applicants</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((job) => (
                    <tr key={job.job_id} className="border-t border-border hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company_name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.location}
                        {job.work_location && <span className="block text-xs">{workLocationLabel(job.work_location)}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{job.job_type}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(job.created_at)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <Link href={`/dashboard/applicants?job=${job.job_id}`} className="font-medium text-primary hover:underline">
                          {counts[job.job_id] ?? 0}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={job.is_active ? "success" : "secondary"}>{job.is_active ? "Open" : "Closed"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/jobs/${job.job_id}`} target="_blank" aria-label={`View ${job.title} public page`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/applicants?job=${job.job_id}`} aria-label={`Applicants for ${job.title}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Users className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/jobs/${job.job_id}`} aria-label={`Edit ${job.title}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-20"
                            onClick={() => toggle(job.job_id, Boolean(job.is_active))}
                            isLoading={togglingId === job.job_id}
                            disabled={togglingId !== null && togglingId !== job.job_id}
                          >
                            {togglingId === job.job_id ? "" : job.is_active ? "Close" : "Reopen"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm" aria-label="Pagination">
              <span className="text-muted-foreground">
                {filtered.length} jobs · page {currentPage} of {totalPages}
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
      )}
    </>
  );
}
