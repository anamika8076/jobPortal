"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { cn, formatDate, formatSalary } from "@/lib/utils";
import { ApplicationStatus } from "@/types";
import { useMyApplications } from "@/components/seeker/useMyApplications";
import { ApplicationStatusBadge, SEEKER_STATUS_LABEL } from "@/components/ApplicationStatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { PageHeader } from "@/components/shell/DashboardUI";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText } from "lucide-react";

type Filter = "all" | ApplicationStatus;
const FILTERS: Filter[] = ["all", "Submitted", "Hired", "Rejected"];

export default function MyApplicationsPage() {
  const { applications, loading, error, reload } = useMyApplications();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: applications.length, Submitted: 0, Hired: 0, Rejected: 0 };
    applications.forEach((a) => (c[a.status] += 1));
    return c;
  }, [applications]);

  const visible = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <>
      <PageHeader
        title="My Applications"
        description="Every job you've applied for. You'll get an email whenever a recruiter updates one."
      />

      {loading ? (
        <LoadingState label="Loading applications..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="When you apply for a job it will show up here with its status."
          action={
            <Link href="/account/jobs">
              <Button>Find jobs</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t",
                  filter === f ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : SEEKER_STATUS_LABEL[f]}
                <span
                  className={cn(
                    "ml-2 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    filter === f ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No applications here.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">Job</th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 font-medium text-right">Salary</th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 font-medium">Applied</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Resume</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((app) => (
                  <tr key={app.application_id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/account/jobs/${app.job_id}`} className="font-medium text-foreground hover:text-primary capitalize">
                        {app.job_title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {app.job_location}
                        <span className="sm:hidden"> · {formatDate(app.applied_at)}</span>
                      </p>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-right tabular-nums text-muted-foreground">
                      {formatSalary(app.job_salary) ?? "—"}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="px-4 py-4">
                      <ApplicationStatusBadge status={app.status} label={SEEKER_STATUS_LABEL[app.status]} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {app.resume && (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Resume sent for ${app.job_title}`}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden lg:inline">Resume</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </>
  );
}
