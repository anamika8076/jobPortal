"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState } from "@/components/StatusViews";
import { EmployerHome } from "@/components/EmployerHome";
import {
  ArrowRight,
  Bell,
  Building2,
  ClipboardList,
  FileCheck2,
  FileText,
  MapPin,
  Search,
  Send,
  UserRound,
  Users,
  BarChart3,
} from "lucide-react";

const POPULAR_SEARCHES = ["Frontend", "Backend", "Full stack", "Data", "Designer", "Internship"];

const workLocationLabel = (w?: string | null) => (w === "on-site" ? "On-site" : w);

function HeroSearch() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("search", title.trim());
    if (location.trim()) params.set("location", location.trim());
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="rounded-xl border border-border bg-card p-2 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-lg px-3 h-11 focus-within:bg-muted/60">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Job title or keyword</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job title or keyword"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="hidden sm:block w-px bg-border my-2" aria-hidden />
        <label className="flex flex-1 items-center gap-2 rounded-lg px-3 h-11 focus-within:bg-muted/60">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or region"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </label>
        <Button type="submit" className="h-11 px-6">
          Search jobs
        </Button>
      </div>
    </form>
  );
}

function LatestJobs() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    jobApi
      .get<Job[]>("/all")
      .then(({ data }) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-foreground">Latest openings</h2>
          {jobs && jobs.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {jobs.length} open role{jobs.length === 1 ? "" : "s"} right now
            </p>
          )}
        </div>
        <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {failed ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">Couldn&apos;t load jobs right now.</p>
      ) : jobs === null ? (
        <ul aria-busy="true" aria-label="Loading jobs">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex gap-3 px-5 py-4 border-b border-border last:border-0">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : jobs.length === 0 ? (
        <div className="px-5 py-10 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">No open roles yet</p>
          <p className="text-sm text-muted-foreground">New jobs will show up here as soon as companies post them.</p>
        </div>
      ) : (
        <ul>
          {jobs.slice(0, 5).map((job) => {
            const salary = formatSalary(job.salary);
            return (
              <li key={job.job_id} className="border-b border-border last:border-0">
                <Link href={`/jobs/${job.job_id}`} className="group flex gap-3 px-5 py-4 hover:bg-muted/50 transition-colors">
                  <Avatar src={job.company_logo} fallbackText={job.company_name} size="md" className="rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary truncate capitalize">{job.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {job.company_name} · {job.location}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[job.job_type, workLocationLabel(job.work_location), salary].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(job.created_at)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const SEEKER_STEPS = [
  {
    icon: UserRound,
    title: "Create your profile",
    text: "Add your skills and upload your resume once. It's attached to every application you send.",
  },
  {
    icon: Send,
    title: "Apply in one click",
    text: "Find a role you like and apply straight from the job page. No forms to fill in again.",
  },
  {
    icon: Bell,
    title: "Hear back by email",
    text: "When a recruiter updates your application you get an email, and you can check every status in one list.",
  },
];

const EMPLOYER_FEATURES = [
  { icon: Building2, title: "Company page", text: "Add your company, logo and website, then post jobs under it." },
  { icon: Users, title: "Applicants in one place", text: "See every candidate with their resume, skills and contact details." },
  { icon: ClipboardList, title: "Simple status updates", text: "Mark candidates as hired or rejected. They're emailed automatically." },
  { icon: BarChart3, title: "Hiring reports", text: "Track applications per week and per job, and how many you've hired." },
];

// Guests and job seekers: search-first job board home
function JobSeekerHome() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="container px-4 md:px-6 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div className="space-y-6 lg:pt-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                Find a job you&apos;ll
                <br className="hidden sm:block" /> actually want to keep.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Search open roles from companies hiring on Hirely, apply with your saved resume, and keep track of every
                application in one place.
              </p>

              <HeroSearch />

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Popular:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <Link
                    key={term}
                    href={`/jobs?search=${encodeURIComponent(term)}`}
                    className="rounded-full border border-border bg-card px-3 py-1 text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <LatestJobs />
          </div>
        </div>
      </section>

      {/* Job seekers */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl space-y-2 mb-10">
            <p className="text-sm font-semibold text-primary">For job seekers</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Applying shouldn&apos;t be a second job</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {SEEKER_STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Check your resume before you apply</h3>
                <p className="text-sm text-muted-foreground">
                  Get a score for how well your resume reads in applicant tracking systems, with specific fixes.
                </p>
              </div>
            </div>
            <Link href={user?.role === "jobseeker" ? "/ai" : "/register"} className="shrink-0">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Check my resume
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Employers */}
      <section className="py-16 md:py-20 border-y border-border bg-muted/30">
        <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">For employers</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Post a job and start reviewing candidates today</h2>
            <p className="text-muted-foreground">
              Create a recruiter account, add your company and publish your first role. Applications arrive with the
              candidate&apos;s resume already attached.
            </p>
            <Link href="/register" className="inline-block pt-2">
              <Button className="gap-2">
                Start hiring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {EMPLOYER_FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl border border-border bg-card p-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Your next role might already be listed</h2>
              <p className="text-muted-foreground">Browse what&apos;s open now. Creating an account takes about a minute.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/jobs">
                <Button>Browse jobs</Button>
              </Link>
              {!user && (
                <Link href="/register">
                  <Button variant="outline">Create an account</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Every recruiter sees the same employer home; everyone else sees the job board home
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (user?.role === "recruiter") return <EmployerHome />;
  return <JobSeekerHome />;
}
