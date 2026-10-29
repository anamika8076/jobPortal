"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { applicantCounts, applicationsByWeek, statusCounts } from "@/lib/recruiterStats";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { ColumnChart, PageHeader, SectionCard, StatCard } from "@/components/shell/DashboardUI";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, CheckCircle2, Clock, PlusCircle, Users, ArrowRight, MapPin } from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { companies, jobs, applications, loading, error, refresh, profiles, loadProfiles } = useRecruiterData();

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.applied_at ?? 0).getTime() - new Date(a.applied_at ?? 0).getTime())
        .slice(0, 6),
    [applications]
  );

  useEffect(() => {
    loadProfiles(recent.map((a) => a.applicant_id));
  }, [recent, loadProfiles]);

  if (loading) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const firstName = user?.name.split(" ")[0] ?? "there";

  if (companies.length === 0) {
    return (
      <>
        <PageHeader title={`Welcome, ${firstName}`} description="Set up your company to start hiring." />
        <EmptyState
          icon={Building2}
          title="Create your company profile"
          description="Jobs are posted under a company. Add yours first, then post your first job."
          action={
            <Link href="/dashboard/company">
              <Button variant="brand">Create company</Button>
            </Link>
          }
        />
      </>
    );
  }

  const activeJobs = jobs.filter((j) => j.is_active);
  const counts = statusCounts(applications);
  const perJob = applicantCounts(applications);
  const weekly = applicationsByWeek(applications);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your job posts."
        actions={
          <>
            <Link href="/dashboard/post-job">
              <Button variant="brand" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Post a Job
              </Button>
            </Link>
            <Link href="/dashboard/applicants">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                View Applicants
              </Button>
            </Link>
            <Link href="/dashboard/company">
              <Button variant="outline" className="gap-2">
                <Building2 className="h-4 w-4" />
                Company Profile
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active jobs" value={activeJobs.length} icon={Briefcase} hint={`${jobs.length} total posted`} />
        <StatCard label="Total applicants" value={applications.length} icon={Users} />
        <StatCard label="Awaiting review" value={counts.Submitted} icon={Clock} hint="Status: Submitted" />
        <StatCard label="Hired" value={counts.Hired} icon={CheckCircle2} hint={`${counts.Rejected} rejected`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Hiring activity · applications per week" className="xl:col-span-2">
          {applications.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No applications yet. Activity will appear here once candidates apply.
            </p>
          ) : (
            <ColumnChart data={weekly} valueLabel="Applications" ariaLabel="Applications received per week over the last 8 weeks" />
          )}
        </SectionCard>

        <SectionCard
          title="Active job listings"
          action={
            <Link href="/dashboard/jobs" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          }
        >
          {activeJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open jobs. Post one to start receiving applications.</p>
          ) : (
            <ul className="space-y-3">
              {activeJobs.slice(0, 5).map((job) => (
                <li key={job.job_id}>
                  <Link
                    href={`/dashboard/applicants?job=${job.job_id}`}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 -m-2 hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0 tabular-nums">
                      {perJob[job.job_id] ?? 0} applicants
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent applications"
        action={
          <Link href="/dashboard/applicants" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 md:px-6 py-2 font-medium">Candidate</th>
                  <th className="px-3 py-2 font-medium">Job</th>
                  <th className="px-3 py-2 font-medium">Applied</th>
                  <th className="px-5 md:px-6 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((app) => {
                  const profile = profiles[app.applicant_id];
                  return (
                    <tr key={app.application_id} className="border-t border-border hover:bg-accent/50 transition-colors">
                      <td className="px-5 md:px-6 py-3">
                        <Link href={`/dashboard/applicants/${app.application_id}`} className="flex items-center gap-3 hover:text-primary">
                          <Avatar src={profile?.profile_pic} fallbackText={profile?.name || app.applicant_email} size="sm" />
                          <span className="font-medium truncate max-w-[180px]">{profile?.name || app.applicant_email}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground truncate max-w-[200px]">{app.job_title}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(app.applied_at)}</td>
                      <td className="px-5 md:px-6 py-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
