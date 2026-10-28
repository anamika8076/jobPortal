import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Cpu,
  Layers,
  Lock,
  Sparkles,
  Users,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  const services = [
    {
      name: "Auth Service",
      port: "5000",
      description: "JWT-based authentication, bcrypt hashing, Redis token expiry, Kafka password reset email producer.",
      icon: Lock,
      badge: "Port 5000",
    },
    {
      name: "Utils Service",
      port: "5001",
      description: "Cloudinary upload management, Google Gemini AI ATS resume evaluation, AI career path suggestions, Kafka mail consumer.",
      icon: Sparkles,
      badge: "Port 5001",
    },
    {
      name: "User Service",
      port: "5002",
      description: "User profiles, skill management, resume & profile photo updates, job application submissions and tracking.",
      icon: Users,
      badge: "Port 5002",
    },
    {
      name: "Job Service",
      port: "5003",
      description: "Company directory, job posting lifecycle, application management, email notifications via Kafka pipeline.",
      icon: Briefcase,
      badge: "Port 5003",
    },
  ];

  return (
    <div className="container py-12 md:py-20 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="info" className="gap-1.5 px-3 py-1">
          <Layers className="h-3.5 w-3.5" />
          About HireHeaven
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Built for the Future of Recruitment
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          HireHeaven is an intelligent, high-performance job board built upon a modular distributed microservice architecture. We empower job seekers with AI-driven insights while giving recruiters a seamless hiring pipeline.
        </p>
      </div>

      {/* Architecture Showcase */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Distributed Microservices Architecture
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Each domain is decoupled and scalable independently, communicating via REST and Kafka event streams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Card key={svc.name} className="border-border/80 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {svc.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {svc.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dual Value Proposition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 border-border/80 bg-gradient-to-br from-card to-accent/20">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">For Job Seekers</h3>
            <p className="text-sm text-muted-foreground">
              Take the guesswork out of applying with intelligent resume feedback and direct recruiter reach.
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                Automatic ATS compatibility score & recommendations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                AI-driven career path and skills suggestions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                Real-time application status tracking
              </li>
            </ul>
            <div className="pt-2">
              <Link href="/register">
                <Button variant="default" size="sm">
                  Join as Job Seeker
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-border/80 bg-gradient-to-br from-card to-accent/20">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">For Recruiters & Companies</h3>
            <p className="text-sm text-muted-foreground">
              Build your verified company profile, post openings, and manage applicants in one unified dashboard.
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                Multi-job listing & company branding tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                Applicant management pipeline (Review, Accept, Reject)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                Automated applicant notifications via Kafka email triggers
              </li>
            </ul>
            <div className="pt-2">
              <Link href="/register">
                <Button variant="outline" size="sm">
                  Register as Recruiter
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
