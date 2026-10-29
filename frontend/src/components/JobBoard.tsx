"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { jobApi, getErrorMessage } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/utils";
import { Job } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusViews";
import { Briefcase, MapPin, Banknote, Search, Building2, Calendar, ArrowRight } from "lucide-react";

const PAGE_SIZE = 10;

// Searchable, paginated list of active jobs. detailBasePath decides where a job card links.
export function JobBoard({ detailBasePath = "/jobs" }: { detailBasePath?: string }) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async (title: string, location: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (title.trim()) params.title = title.trim();
      if (location.trim()) params.location = location.trim();

      const response = await jobApi.get<Job[]>("/all", { params });
      setJobs(Array.isArray(response.data) ? response.data : []);
      setPage(1);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load jobs. Is the job service running?"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchTitle(initialSearch);
    setSearchLocation(initialLocation);
    fetchJobs(initialSearch, initialLocation);
  }, [fetchJobs, initialSearch, initialLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchTitle, searchLocation);
  };

  const resetFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    fetchJobs("", "");
  };

  // The backend returns every active job, so pagination happens client-side
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const visibleJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Search and Filters */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3" role="search">
            <div className="flex-1">
              <Input
                aria-label="Job title"
                placeholder="Search job title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <div className="w-full md:w-72">
              <Input
                aria-label="Location"
                placeholder="Location (e.g. Remote, Bangalore)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Button type="submit" variant="gradient" className="gap-2">
              <Search className="h-4 w-4" />
              Find Jobs
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <LoadingState label="Loading opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchJobs(searchTitle, searchLocation)} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="No active jobs match your search yet. Try a broader title or location."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground pb-2">
              Showing {jobs.length} open position{jobs.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-1 gap-4">
              {visibleJobs.map((job) => (
                <JobCard key={job.job_id} job={job} href={`${detailBasePath}/${job.job_id}`} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Pagination">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}

function JobCard({ job, href }: { job: Job; href: string }) {
  const salary = formatSalary(job.salary);

  return (
    <Link href={href} className="block group">
      <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <Avatar src={job.company_logo} fallbackText={job.company_name} size="lg" className="rounded-lg" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </h2>
                  {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
                  {job.work_location && (
                    <Badge variant="outline" className="capitalize">
                      {job.work_location}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {job.company_name && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{job.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  {salary && (
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Banknote className="h-4 w-4 text-emerald-500" />
                      <span>{salary}</span>
                    </div>
                  )}
                  {job.created_at && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl pt-1">{job.description}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary shrink-0">
              View details
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
