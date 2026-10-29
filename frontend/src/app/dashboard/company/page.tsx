"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { formatDate } from "@/lib/utils";
import { LoadingState, ErrorState } from "@/components/StatusViews";
import { PageHeader } from "@/components/recruiter/DashboardUI";
import { CreateCompanyForm } from "@/components/recruiter/CreateCompanyForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ArrowRight, ExternalLink, Plus } from "lucide-react";

export default function CompanyProfilePage() {
  const { companies, jobs, loading, error, refresh } = useRecruiterData();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <LoadingState label="Loading companies..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const formVisible = showForm || companies.length === 0;

  return (
    <>
      <PageHeader
        title="Company Profile"
        description="The companies you hire for. Candidates see the name, logo, website and description."
        actions={
          !formVisible && (
            <Button variant="brand" className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add company
            </Button>
          )
        }
      />

      {formVisible && (
        <CreateCompanyForm
          onCancel={companies.length > 0 ? () => setShowForm(false) : undefined}
          onCreated={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => {
          const jobCount = jobs.filter((j) => j.company_id === company.company_id).length;
          return (
            <Card key={company.company_id} className="p-6 hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="flex gap-4">
                  <Avatar src={company.logo} fallbackText={company.name} size="xl" className="rounded-xl" />
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-lg font-bold truncate">{company.name}</h3>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {jobCount} job{jobCount === 1 ? "" : "s"} · created {formatDate(company.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{company.description}</p>
                <Link
                  href={`/dashboard/company/${company.company_id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View company <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
