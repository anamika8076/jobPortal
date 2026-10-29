"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { userApi, getErrorMessage } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/utils";
import { Application } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { Banknote, Calendar, ClipboardList, FileText, MapPin } from "lucide-react";

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userApi.get<Application[]>("/application/all");
      setApplications(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your applications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container max-w-4xl py-10 md:py-14 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Track the status of every job you&apos;ve applied for.</p>
      </div>

      {loading ? (
        <LoadingState label="Loading applications..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="When you apply for a job it will show up here."
          action={
            <Link href="/jobs">
              <Button variant="gradient">Browse jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const salary = formatSalary(app.job_salary);
            return (
              <Card key={app.application_id}>
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Link href={`/jobs/${app.job_id}`} className="text-lg font-bold hover:text-primary">
                      {app.job_title}
                    </Link>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {app.job_location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {app.job_location}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1.5">
                          <Banknote className="h-4 w-4 text-emerald-500" />
                          {salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Applied {formatDate(app.applied_at)}
                      </span>
                      {app.resume && (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          Submitted resume
                        </a>
                      )}
                    </div>
                  </div>
                  <ApplicationStatusBadge status={app.status} className="self-start sm:self-center" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
