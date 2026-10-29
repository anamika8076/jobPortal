"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { jobApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Job } from "@/types";
import { useMyApplications } from "@/components/seeker/useMyApplications";
import { ApplicationStatusBadge, SEEKER_STATUS_LABEL } from "@/components/ApplicationStatusBadge";
import { LoadingState, ErrorState } from "@/components/StatusViews";
import { PageHeader, SectionCard, StatCard } from "@/components/shell/DashboardUI";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CheckCircle2, ClipboardList, Clock, Search, XCircle } from "lucide-react";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { applications, loading, error, reload } = useMyApplications();
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    jobApi
      .get<Job[]>("/all")
      .then(({ data }) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]));
  }, []);

  // Open jobs whose title, role or description mentions one of the user's skills, excluding ones already applied to
  const skillMatches = useMemo(() => {
    if (!jobs || !user || user.skills.length === 0) return [];
    const applied = new Set(applications.map((a) => a.job_id));
    const skills = user.skills.map((s) => s.toLowerCase());
    return jobs
      .filter((job) => !applied.has(job.job_id))
      .map((job) => {
        const text = `${job.title} ${job.role ?? ""} ${job.description}`.toLowerCase();
        return { job, matched: user.skills.filter((_, i) => text.includes(skills[i])) };
      })
      .filter((m) => m.matched.length > 0)
      .sort((a, b) => b.matched.length - a.matched.length)
      .slice(0, 5);
  }, [jobs, user, applications]);

  if (!user) return null;
  if (loading) return <LoadingState label="Loading your account..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const firstName = user.name.split(" ")[0];
  const count = (status: string) => applications.filter((a) => a.status === status).length;

  const checklist = [
    { done: Boolean(user.resume), label: "Upload your resume", href: "/account/profile" },
    { done: user.skills.length >= 3, label: "Add at least 3 skills", href: "/account/profile" },
    { done: Boolean(user.profile_pic), label: "Add a profile photo", href: "/account/settings" },
    { done: Boolean(user.bio), label: "Write a short bio", href: "/account/settings" },
    { done: Boolean(user.phone_number), label: "Add a phone number", href: "/account/settings" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your applications and job search at a glance."
        actions={
          <Link href="/account/jobs">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Find jobs
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Applications" value={applications.length} icon={ClipboardList} />
        <StatCard label="Under review" value={count("Submitted")} icon={Clock} />
        <StatCard label="Hired" value={count("Hired")} icon={CheckCircle2} />
        <StatCard label="Not selected" value={count("Rejected")} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          title="Recent applications"
          className="xl:col-span-2"
          action={
            <Link href="/account/applications" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {applications.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">You haven&apos;t applied for anything yet.</p>
              <Link href="/account/jobs">
                <Button variant="outline" size="sm">
                  Browse open jobs
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border -my-2">
              {applications.slice(0, 5).map((app) => (
                <li key={app.application_id}>
                  <Link
                    href={`/account/jobs/${app.job_id}`}
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate capitalize group-hover:text-primary">{app.job_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.job_location} · applied {formatDate(app.applied_at)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} label={SEEKER_STATUS_LABEL[app.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Profile strength">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-foreground tabular-nums">{percent}%</span>
            <span className="text-xs text-muted-foreground">
              {doneCount} of {checklist.length} done
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-4" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
          <ul className="space-y-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 text-sm hover:bg-muted transition-colors"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      item.done ? "bg-primary text-primary-foreground" : "border border-input"
                    }`}
                  >
                    {item.done && <Check className="h-3 w-3" />}
                  </span>
                  <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Open jobs that mention your skills"
        action={
          <Link href="/account/jobs" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            All jobs <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        {user.skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Link href="/account/profile" className="text-primary hover:underline">
              Add your skills
            </Link>{" "}
            to see open jobs that mention them.
          </p>
        ) : jobs === null ? (
          <p className="text-sm text-muted-foreground">Looking for matching jobs...</p>
        ) : skillMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open jobs mention your skills right now. New jobs are posted regularly.</p>
        ) : (
          <ul className="divide-y divide-border -my-2">
            {skillMatches.map(({ job, matched }) => (
              <li key={job.job_id}>
                <Link href={`/account/jobs/${job.job_id}`} className="group flex items-center gap-3 py-3">
                  <Avatar src={job.company_logo} fallbackText={job.company_name} size="md" className="rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate capitalize group-hover:text-primary">{job.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {job.company_name} · {job.location}
                    </p>
                  </div>
                  <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">
                    Mentions {matched.slice(0, 3).join(", ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
