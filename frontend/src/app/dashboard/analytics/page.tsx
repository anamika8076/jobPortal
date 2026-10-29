"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { applicantsByJob, applicationsByWeek, statusCounts } from "@/lib/recruiterStats";
import { cn, formatDate } from "@/lib/utils";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { ColumnChart, HorizontalBarChart, PageHeader, SectionCard, StatCard } from "@/components/shell/DashboardUI";
import { Button } from "@/components/ui/button";
import { BarChart3, CheckCircle2, Clock, Percent, Users, XCircle, LucideIcon } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

// Status colors are reserved for state and always shown with an icon and label
const STATUS_STYLE: Record<ApplicationStatus, { bar: string; icon: LucideIcon; text: string }> = {
  Submitted: { bar: "bg-slate-500 dark:bg-slate-400", icon: Clock, text: "text-slate-600 dark:text-slate-300" },
  Hired: { bar: "bg-emerald-600 dark:bg-emerald-500", icon: CheckCircle2, text: "text-emerald-700 dark:text-emerald-400" },
  Rejected: { bar: "bg-red-600 dark:bg-red-500", icon: XCircle, text: "text-red-700 dark:text-red-400" },
};

function percent(part: number, whole: number): string {
  return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`;
}

export default function AnalyticsPage() {
  const { jobs, applications, loading, error, refresh } = useRecruiterData();

  const jobRows = useMemo(
    () =>
      jobs
        .map((job) => {
          const apps = applications.filter((a) => a.job_id === job.job_id);
          const hired = apps.filter((a) => a.status === "Hired").length;
          const rejected = apps.filter((a) => a.status === "Rejected").length;
          const daysOpen = job.created_at ? Math.max(1, Math.round((Date.now() - new Date(job.created_at).getTime()) / DAY_MS)) : null;
          return { job, total: apps.length, hired, rejected, daysOpen, openings: Number(job.openings ?? 0) };
        })
        .sort((a, b) => b.total - a.total),
    [jobs, applications]
  );

  if (loading) return <LoadingState label="Crunching your numbers..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  if (applications.length === 0) {
    return (
      <>
        <PageHeader title="Analytics" description="Calculated from your real jobs and applications." />
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Analytics appear once candidates start applying to your jobs."
          action={
            <Link href="/dashboard/post-job">
              <Button variant="brand">Post a Job</Button>
            </Link>
          }
        />
      </>
    );
  }

  const counts = statusCounts(applications);
  const decided = counts.Hired + counts.Rejected;

  return (
    <>
      <PageHeader title="Analytics" description="Calculated live from your jobs and applications. Nothing here is sample data." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Applications" value={applications.length} icon={Users} />
        <StatCard label="Reviewed" value={percent(decided, applications.length)} icon={Percent} hint={`${decided} hired or rejected`} />
        <StatCard label="Hire rate" value={percent(counts.Hired, decided)} icon={CheckCircle2} hint="Of reviewed applications" />
        <StatCard label="Awaiting review" value={counts.Submitted} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Applications over time · last 12 weeks">
          <ColumnChart
            data={applicationsByWeek(applications, 12)}
            valueLabel="Applications"
            ariaLabel="Applications received per week over the last 12 weeks"
          />
        </SectionCard>

        <SectionCard title="Applicants by job · top 8">
          <HorizontalBarChart data={applicantsByJob(jobs, applications)} valueLabel="Applicants" ariaLabel="Number of applicants for each job" />
        </SectionCard>

        <SectionCard title="Application status">
          <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label="Share of applications by status">
            {APPLICATION_STATUSES.filter((s) => counts[s] > 0).map((s) => (
              <div key={s} className={STATUS_STYLE[s].bar} style={{ width: `${(counts[s] / applications.length) * 100}%` }} title={`${s}: ${counts[s]}`} />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {APPLICATION_STATUSES.map((s) => {
              const { icon: Icon, text, bar } = STATUS_STYLE[s];
              return (
                <li key={s} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", bar)} aria-hidden />
                    <Icon className={cn("h-4 w-4", text)} />
                    {s}
                  </span>
                  <span className="tabular-nums font-medium">
                    {counts[s]} <span className="text-muted-foreground font-normal">({percent(counts[s], applications.length)})</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Hiring funnel">
          <ol className="space-y-3">
            {[
              { label: "Applied", value: applications.length },
              { label: "Reviewed (hired or rejected)", value: decided },
              { label: "Hired", value: counts.Hired },
            ].map((stage) => (
              <li key={stage.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stage.label}</span>
                  <span className="tabular-nums font-medium">
                    {stage.value} <span className="text-muted-foreground font-normal">({percent(stage.value, applications.length)})</span>
                  </span>
                </div>
                <div className="h-3 rounded-r-[4px] bg-muted overflow-hidden">
                  <div className="h-full rounded-r-[4px] bg-primary" style={{ width: `${(stage.value / applications.length) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <SectionCard title="Job performance">
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 md:px-6 py-2 font-medium">Job</th>
                <th className="px-3 py-2 font-medium">Posted</th>
                <th className="px-3 py-2 font-medium text-right">Applicants</th>
                <th className="px-3 py-2 font-medium text-right">Per week open</th>
                <th className="px-3 py-2 font-medium text-right">Hired / openings</th>
                <th className="px-5 md:px-6 py-2 font-medium text-right">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {jobRows.map(({ job, total, hired, rejected, daysOpen, openings }) => (
                <tr key={job.job_id} className="border-t border-border">
                  <td className="px-5 md:px-6 py-2.5">
                    <Link href={`/dashboard/applicants?job=${job.job_id}`} className="font-medium hover:text-primary">
                      {job.title}
                    </Link>
                    {!job.is_active && <span className="ml-2 text-xs text-muted-foreground">(closed)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{formatDate(job.created_at)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{total}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{daysOpen ? (total / Math.max(1, daysOpen / 7)).toFixed(1) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {hired} / {openings || "—"}
                  </td>
                  <td className="px-5 md:px-6 py-2.5 text-right tabular-nums">{rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
