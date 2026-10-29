import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Building2,
  FileSearch,
  Mail,
  PenLine,
  Plus,
  Users,
} from "lucide-react";

// The home page every recruiter sees: general guidance about hiring on Hirely, no personal data
const STEPS = [
  { title: "Add your company", text: "Create a company page with your logo, website and a short description candidates will read." },
  { title: "Post a job", text: "Write the role, location, salary and openings. It goes live on the job board straight away." },
  { title: "Review applicants", text: "Every application arrives with the candidate's resume, skills and contact details attached." },
  { title: "Make a decision", text: "Mark candidates as hired or rejected. Hirely emails them the update for you." },
];

const TOOLS = [
  { icon: Building2, title: "Company profiles", text: "Hire for more than one company from the same account." },
  { icon: Users, title: "Applicant tracking", text: "Search candidates by name or skill and filter by job or status." },
  { icon: FileSearch, title: "Resume insights", text: "Run a candidate's resume through an ATS check to spot gaps quickly." },
  { icon: Mail, title: "Automatic emails", text: "Candidates hear back as soon as you change their application status." },
  { icon: BarChart3, title: "Hiring reports", text: "See applications per week, per job, and how many you've hired." },
  { icon: PenLine, title: "Edit any time", text: "Update a posting or close it once the role is filled." },
];


export function EmployerHome() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="container px-4 md:px-6 py-14 md:py-20">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold text-primary">Hirely for employers</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Post a role, review candidates, and hire from one place.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Publish jobs under your company, see every applicant with their resume attached, and keep candidates
              updated without writing a single email.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/dashboard/post-job">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post a job
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How hiring works */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl space-y-2 mb-10">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">From first post to first hire</h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary mb-4">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 md:py-20 border-y border-border bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl space-y-2 mb-10">
            <p className="text-sm font-semibold text-primary">What you get</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Everything you need to run a hiring process</h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ icon: Icon, title, text }) => (
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Ready to post?</h2>
              <p className="text-muted-foreground">It takes a few minutes. You can edit or close the job whenever you like.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/post-job">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post a job
                </Button>
              </Link>
              <Link href="/dashboard/applicants">
                <Button variant="outline">View applicants</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
