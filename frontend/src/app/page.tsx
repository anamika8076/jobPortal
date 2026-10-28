"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Search,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-background via-accent/30 to-background border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(0,0,0,0))]" />

        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <Badge variant="info" className="gap-1.5 px-3 py-1 text-xs md:text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Empowering Careers & High-Growth Hiring
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
              Land Your Next Job at{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                HireHeaven
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Connect directly with verified recruiters, showcase your skills, and leverage smart microservices built for modern job seekers and employers.
            </p>

            {/* Quick Search Preview */}
            <div className="w-full max-w-3xl bg-card border border-border p-2 md:p-3 rounded-2xl shadow-xl shadow-indigo-500/5 mt-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center w-full px-3 py-2 bg-muted/40 rounded-xl border border-border/50">
                  <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company..."
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                    readOnly
                  />
                </div>
                <div className="flex items-center w-full sm:w-72 px-3 py-2 bg-muted/40 rounded-xl border border-border/50">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Location or 'Remote'..."
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                    readOnly
                  />
                </div>
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button variant="gradient" className="w-full gap-2">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Button>
                </Link>
              </div>

              {/* Popular tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Trending:</span>
                {["Software Engineer", "Frontend", "Product Manager", "DevOps", "Remote"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/jobs?search=${encodeURIComponent(tag)}`}
                    className="bg-muted px-2.5 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/jobs">
                <Button size="lg" variant="gradient" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Browse All Jobs
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Candidates & Recruiters Choose Us
            </h2>
            <p className="text-muted-foreground">
              Designed from the ground up for speed, reliability, and security with a decoupled microservice architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-border/80">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Verified Opportunities</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every company profile and recruiter is authenticated. Apply with confidence to vetted positions from premier teams.
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Verified recruiter badges
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Real-time status updates
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-border/80">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Smart Career Tools</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Integrated ATS resume analysis and career pathway suggestions give candidates a competitive edge.
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Instant ATS compatibility check
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Targeted skill gap recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-border/80">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Microservice Powered</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  High-availability Auth, User, Job, and Utils microservices ensure blazing-fast response times and high security.
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Secure JWT cookie authentication
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Distributed event-driven pipeline
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/40 border-t border-border/60">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-cyan-900/90 text-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ready to take the next leap?
              </h3>
              <p className="text-indigo-100 max-w-md text-sm md:text-base">
                Create your account in seconds, upload your resume, and connect with top hiring managers today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/register">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-md">
                  Get Started
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
