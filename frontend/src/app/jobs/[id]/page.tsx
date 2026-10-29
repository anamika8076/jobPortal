"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { jobApi, userApi, getErrorMessage } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Application, Company, Job } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState, ErrorState } from "@/components/StatusViews";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { user, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Pick<Company, "name" | "logo" | "website" | "description"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await jobApi.get<Job>(`/${jobId}`);
      setJob(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this job"));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // Company details need auth; guests get name and logo from the public job list
  useEffect(() => {
    if (!job || authLoading) return;
    const loadCompany = async () => {
      try {
        if (user) {
          const { data } = await jobApi.get<Company>(`/company/${job.company_id}`);
          setCompany(data);
        } else {
          const { data } = await jobApi.get<Job[]>("/all");
          const match = data.find((j) => j.job_id === job.job_id);
          if (match?.company_name) {
            setCompany({ name: match.company_name, logo: match.company_logo, website: "", description: "" });
          }
        }
      } catch {
        // Company info is optional on this page
      }
    };
    loadCompany();
  }, [job, user, authLoading]);

  useEffect(() => {
    if (user?.role !== "jobseeker" || !job) return;
    userApi
      .get<Application[]>("/application/all")
      .then(({ data }) => setHasApplied(data.some((a) => a.job_id === job.job_id)))
      .catch(() => undefined);
  }, [user, job]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      const { data } = await userApi.post<{ message: string }>("/apply/job", { job_id: job.job_id });
      toast.success(data.message || "Application submitted");
      setHasApplied(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not submit your application"));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingState label="Loading job..." />;

  if (error || !job) {
    return (
      <div className="container max-w-3xl py-12">
        <ErrorState message={error || "Job not found"} onRetry={loadJob} />
      </div>
    );
  }

  const salary = formatSalary(job.salary);
  const isOwner = user?.role === "recruiter" && user.user_id === job.posted_by_recruiter_id;

  const renderAction = () => {
    if (!job.is_active) {
      return <Badge variant="warning">This job is no longer accepting applications</Badge>;
    }
    if (authLoading) return null;
    if (!user) {
      return (
        <Link href={`/login?redirect=/jobs/${job.job_id}`}>
          <Button variant="gradient">Sign in to apply</Button>
        </Link>
      );
    }
    if (isOwner) {
      return (
        <Link href={`/dashboard/applicants?job=${job.job_id}`}>
          <Button variant="gradient" className="gap-2">
            <Users className="h-4 w-4" />
            View applicants
          </Button>
        </Link>
      );
    }
    if (user.role !== "jobseeker") return null;
    if (hasApplied) {
      return (
        <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Applied
        </Badge>
      );
    }
    if (!user.resume) {
      return (
        <div className="space-y-2 text-right">
          <p className="text-xs text-muted-foreground">Upload a resume to your profile before applying.</p>
          <Link href="/profile">
            <Button variant="outline">Add resume</Button>
          </Link>
        </div>
      );
    }
    return (
      <Button variant="gradient" onClick={handleApply} isLoading={applying}>
        Apply now
      </Button>
    );
  };

  return (
    <div className="container max-w-4xl py-10 md:py-14 space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-4">
              <Avatar src={company?.logo} fallbackText={company?.name || job.title} size="xl" className="rounded-xl" />
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{job.title}</h1>
                {company?.name && (
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    {company.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
                  {job.work_location && (
                    <Badge variant="outline" className="capitalize">
                      {job.work_location}
                    </Badge>
                  )}
                  {job.role && <Badge variant="info">{job.role}</Badge>}
                </div>
              </div>
            </div>
            <div className="shrink-0">{renderAction()}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-border/60 py-5 text-sm">
            <Fact icon={MapPin} label="Location" value={job.location} />
            <Fact icon={Banknote} label="Salary" value={salary || "Not disclosed"} />
            <Fact icon={Users} label="Openings" value={job.openings ? String(Number(job.openings)) : "—"} />
            <Fact icon={Calendar} label="Posted" value={formatDate(job.created_at) || "—"} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Job description
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{job.description}</p>
          </div>
        </CardContent>
      </Card>

      {company?.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About {company.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Visit website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
