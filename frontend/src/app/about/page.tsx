"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Briefcase, Check, Eye, MailCheck, MousePointerClick, UserRound, LayoutList } from "lucide-react";

const PRINCIPLES = [
  {
    icon: MailCheck,
    title: "Every application deserves an answer",
    text: "When a recruiter makes a decision, the candidate is emailed straight away. Nobody should have to guess whether they're still in the running.",
  },
  {
    icon: Eye,
    title: "The important details up front",
    text: "Every posting shows the location, work arrangement, job type and salary field, so people can decide quickly whether a role fits.",
  },
  {
    icon: MousePointerClick,
    title: "Applying should take seconds",
    text: "Upload your resume once and it's attached to every application. No re-typing your history into another form.",
  },
  {
    icon: LayoutList,
    title: "One place for hiring",
    text: "Recruiters see postings, applicants, resumes and decisions in a single dashboard instead of spread across inboxes and spreadsheets.",
  },
];

const SEEKER_FEATURES = [
  "Search open roles by title and location",
  "Apply with the resume saved to your profile",
  "Track every application and its status in one list",
  "Check how your resume reads in applicant tracking systems",
];

const EMPLOYER_FEATURES = [
  "Create company pages and post jobs under them",
  "Review applicants with resume, skills and contact details",
  "Mark candidates hired or rejected, with automatic emails",
  "Follow applications per job and per week",
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm text-foreground">
          <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const { user } = useAuth();

  const seekerCta = user?.role === "jobseeker" ? { href: "/jobs", label: "Browse jobs" } : { href: "/register", label: "Create a job seeker account" };
  const employerCta =
    user?.role === "recruiter" ? { href: "/dashboard", label: "Go to dashboard" } : { href: "/register", label: "Create a recruiter account" };

  return (
    <div className="flex flex-col">
      {/* Intro */}
      <section className="border-b border-border bg-muted/30">
        <div className="container px-4 md:px-6 py-14 md:py-20">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-semibold text-primary">About Hirely</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              A simpler way to find work and to hire.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Hirely is a job board that connects people looking for work with the companies hiring them. Candidates
              search and apply in a few clicks. Recruiters post roles and review applicants in one dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Why we built it</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Looking for a job often means filling in the same details over and over, then hearing nothing back. Most
              applications simply disappear, and candidates never learn whether anyone read them.
            </p>
            <p>
              Hiring isn&apos;t much easier from the other side. Recruiters juggle postings in one place, resumes in their
              inbox and decisions in a spreadsheet, and replying to every candidate is the step that usually gets dropped.
            </p>
            <p className="text-foreground">
              Hirely keeps both sides in the same system, so applying is quick and every candidate gets an answer.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-20 border-y border-border bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-10">What we care about</h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-10">Who Hirely is for</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">Job seekers</h3>
              </div>
              <FeatureList items={SEEKER_FEATURES} />
              {user?.role !== "recruiter" && (
                <Link href={seekerCta.href} className="mt-6 self-start">
                  <Button>{seekerCta.label}</Button>
                </Link>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">Employers</h3>
              </div>
              <FeatureList items={EMPLOYER_FEATURES} />
              {user?.role !== "jobseeker" && (
                <Link href={employerCta.href} className="mt-6 self-start">
                  <Button variant={user?.role === "recruiter" ? "default" : "outline"}>{employerCta.label}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
