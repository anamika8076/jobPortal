"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { formatDate } from "@/lib/utils";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { SectionCard } from "@/components/recruiter/DashboardUI";
import { StatusActions } from "@/components/recruiter/StatusActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Download, Mail, Phone, FileSearch, UserX } from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const applicationId = Number(params?.id);
  const { applications, loading, error, refresh, profiles, loadProfiles } = useRecruiterData();

  const application = applications.find((a) => a.application_id === applicationId);

  useEffect(() => {
    if (application) loadProfiles([application.applicant_id]);
  }, [application, loadProfiles]);

  if (loading) return <LoadingState label="Loading candidate..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  if (!application) {
    return (
      <EmptyState
        icon={UserX}
        title="Application not found"
        description="It may belong to a job you don't own, or the job was deleted."
        action={
          <Link href="/dashboard/applicants">
            <Button variant="outline">Back to applicants</Button>
          </Link>
        }
      />
    );
  }

  const profile = profiles[application.applicant_id];
  // Every application this candidate made to any of your jobs
  const history = applications
    .filter((a) => a.applicant_id === application.applicant_id)
    .sort((a, b) => new Date(b.applied_at ?? 0).getTime() - new Date(a.applied_at ?? 0).getTime());
  const displayName = profile?.name || application.applicant_email;

  return (
    <>
      <Link href="/dashboard/applicants" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        All applicants
      </Link>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar src={profile?.profile_pic} fallbackText={displayName} size="xl" className="h-20 w-20" />
            <div className="min-w-0 space-y-1">
              <h2 className="text-2xl font-extrabold truncate">{displayName}</h2>
              <p className="text-sm text-muted-foreground">
                Applied for <span className="font-medium text-foreground">{application.job_title}</span> ·{" "}
                {formatDate(application.applied_at)}
              </p>
              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusActions application={application} size="default" />
            <Link href={`/dashboard/ai?application=${application.application_id}`}>
              <Button variant="brand" className="gap-2">
                <FileSearch className="h-4 w-4" />
                Resume insights
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SectionCard title="Contact">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${application.applicant_email}`} className="hover:text-primary break-all">
                  {application.applicant_email}
                </a>
              </li>
              {profile?.phone_number && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${profile.phone_number}`} className="hover:text-primary">
                    {profile.phone_number}
                  </a>
                </li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title="About">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {profile ? profile.bio || "No bio provided." : "Loading profile..."}
            </p>
          </SectionCard>

          <SectionCard title="Skills">
            {profile && profile.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <li key={s}>
                    <Badge variant="secondary">{s}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            )}
          </SectionCard>

          <SectionCard title="Application timeline">
            <ol className="relative border-l-2 border-border ml-2 space-y-5">
              {history.map((a) => (
                <li key={a.application_id} className="pl-5 relative">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                  <p className="text-sm font-semibold">
                    {a.application_id === application.application_id ? (
                      a.job_title
                    ) : (
                      <Link href={`/dashboard/applicants/${a.application_id}`} className="hover:text-primary">
                        {a.job_title}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Applied {formatDate(a.applied_at)}</p>
                  <div className="mt-1">
                    <ApplicationStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <SectionCard
          title="Resume"
          className="xl:col-span-2"
          action={
            application.resume && (
              <a href={application.resume} target="_blank" rel="noreferrer noopener" download>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
            )
          }
        >
          {application.resume ? (
            <iframe
              src={application.resume}
              title={`Resume of ${displayName}`}
              className="w-full h-[70vh] min-h-[480px] rounded-lg border border-border bg-muted"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No resume attached to this application.</p>
          )}
        </SectionCard>
      </div>

    </>
  );
}
