"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { jobApi, getErrorMessage } from "@/lib/api";
import { Job } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Search,
  Building2,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";

const SAMPLE_JOBS: Job[] = [
  {
    job_id: 1,
    title: "Senior Full Stack Engineer",
    company_name: "TechNova Systems",
    location: "San Francisco, CA",
    salary: "$140,000 - $180,000",
    job_type: "Full-time",
    work_location: "Hybrid",
    description: "Looking for an experienced full stack engineer with expertise in React, Next.js, TypeScript, and microservice architectures.",
    created_at: new Date().toISOString(),
    company_id: 1,
  },
  {
    job_id: 2,
    title: "Lead Frontend Developer",
    company_name: "PixelCraft Studios",
    location: "Remote",
    salary: "$120,000 - $150,000",
    job_type: "Full-time",
    work_location: "Remote",
    description: "Build delightful web experiences and modern component design systems with Tailwind and Next.js.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    company_id: 2,
  },
  {
    job_id: 3,
    title: "Backend Microservices Architect",
    company_name: "CloudScale Inc",
    location: "New York, NY",
    salary: "$160,000 - $200,000",
    job_type: "Contract",
    work_location: "On-site",
    description: "Architect high-performance distributed microservices with Kafka, Redis, PostgreSQL, and Node.js.",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    company_id: 3,
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const params: Record<string, string> = {};
      if (searchTitle.trim()) params.title = searchTitle.trim();
      if (searchLocation.trim()) params.location = searchLocation.trim();

      const response = await jobApi.get<Job[]>("/all", { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setJobs(response.data);
      } else {
        // If backend has no active jobs yet, show placeholder jobs
        setJobs(SAMPLE_JOBS);
      }
    } catch (error) {
      // Backend job service may not have active jobs or DB entries yet; fallback cleanly
      console.warn("Could not fetch active jobs from backend:", getErrorMessage(error));
      setJobs(SAMPLE_JOBS);
      setErrorNotice("Showing preview job listings. Live job service will update once recruiters post jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="container py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Badge variant="info" className="gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          Job Marketplace
        </Badge>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Explore Open Opportunities
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Find your next career match from verified companies across tech, design, marketing, and leadership.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search job title, role or keywords..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <div className="w-full md:w-72">
              <Input
                placeholder="Location (e.g. Remote, NY, CA)..."
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

      {errorNotice && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
          ℹ️ {errorNotice}
        </div>
      )}

      {/* Job Listings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground pb-2">
          <span>Showing {jobs.length} open position{jobs.length === 1 ? "" : "s"}</span>
          <span>Updated in real time</span>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No jobs found matching your criteria</h3>
            <p className="text-sm text-muted-foreground">Try broadening your search term or location.</p>
            <Button variant="outline" onClick={() => { setSearchTitle(""); setSearchLocation(""); fetchJobs(); }}>
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <Card
                key={job.job_id}
                className="hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h2>
                        {job.job_type && (
                          <Badge variant="secondary">{job.job_type}</Badge>
                        )}
                        {job.work_location && (
                          <Badge variant="outline">{job.work_location}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">
                            {job.company_name || "Verified Company"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.created_at && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl pt-1">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                      <Link href={`/login?redirect=/jobs`}>
                        <Button variant="gradient" className="gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
