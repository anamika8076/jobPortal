"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { utilsApi, getErrorMessage } from "@/lib/api";
import { cn, fileToBase64 } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { CareerAdvice, ResumeAnalysis } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ResumeAnalysisView } from "@/components/ResumeAnalysisView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, FileSearch, Upload, Lightbulb } from "lucide-react";

type Tab = "career" | "resume";

function AiContent() {
  const [tab, setTab] = useState<Tab>("career");

  return (
    <div className="container max-w-5xl py-10 md:py-14 space-y-8">
      <div className="space-y-3">
        <Badge variant="info" className="gap-1.5">
          Powered by Gemini
        </Badge>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Career Tools</h1>
        <p className="text-muted-foreground max-w-2xl">
          Get a personalised career path from your skills, or check how well your resume parses in applicant
          tracking systems.
        </p>
      </div>

      <div role="tablist" className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
        <TabButton active={tab === "career"} onClick={() => setTab("career")} icon={Compass} label="Career advisor" />
        <TabButton active={tab === "resume"} onClick={() => setTab("resume")} icon={FileSearch} label="Resume ATS check" />
      </div>

      {tab === "career" ? <CareerAdvisor /> : <ResumeAnalyser />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Compass;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function CareerAdvisor() {
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerAdvice | null>(null);

  useEffect(() => {
    if (user?.skills.length) setSkills(user.skills.join(", "));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim()) {
      toast.error("Enter at least one skill");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await utilsApi.post<CareerAdvice>("/career", { skills: skills.trim() });
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not generate career advice"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Label htmlFor="skills" required>
              Your skills (comma separated)
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="skills"
                placeholder="e.g. React, TypeScript, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <Button type="submit" variant="gradient" isLoading={loading} className="gap-2 shrink-0">
                Suggest careers
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground animate-pulse">Thinking about your career path...</p>}

      {result && (
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-sm leading-relaxed">{result.summary}</CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">Roles that fit you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.jobOptions?.map((job) => (
                <Card key={job.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{job.responsibilities}</p>
                    <p>
                      <span className="font-medium">Why it fits: </span>
                      {job.why}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">Skills to learn next</h2>
            {result.skillsToLearn?.map((group) => (
              <Card key={group.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{group.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.skills.map((skill) => (
                    <div key={skill.title} className="space-y-1 text-sm">
                      <p className="font-semibold">{skill.title}</p>
                      <p className="text-muted-foreground">{skill.why}</p>
                      <p>
                        <span className="font-medium">How: </span>
                        {skill.how}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>

          {result.learningApproach && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {result.learningApproach.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {result.learningApproach.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ResumeAnalyser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }
    if (selected && selected.size > 5 * 1024 * 1024) {
      toast.error("Resume must be smaller than 5 MB");
      return;
    }
    setFile(selected);
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const pdfBase64 = await fileToBase64(file);
      const { data } = await utilsApi.post<ResumeAnalysis>("/resume-analyser", { pdfBase64 });
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not analyse the resume"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload your resume</CardTitle>
          <CardDescription>PDF only, up to 5 MB. The file is sent to the AI for analysis and not saved.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex-1 flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 cursor-pointer hover:bg-accent/50">
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm truncate">{file ? file.name : "Choose a PDF..."}</span>
            <input type="file" accept="application/pdf" className="sr-only" onChange={handleFile} />
          </label>
          <Button variant="gradient" onClick={handleAnalyse} disabled={!file} isLoading={loading}>
            Analyse resume
          </Button>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground animate-pulse">Scanning your resume...</p>}

      {result && <ResumeAnalysisView result={result} />}
    </div>
  );
}

export default function AiPage() {
  return (
    <ProtectedRoute>
      <AiContent />
    </ProtectedRoute>
  );
}
