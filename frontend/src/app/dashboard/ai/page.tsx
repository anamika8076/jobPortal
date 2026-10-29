"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { utilsApi, getErrorMessage } from "@/lib/api";
import { fileToBase64 } from "@/lib/utils";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { ResumeAnalysis } from "@/types";
import { LoadingState, ErrorState } from "@/components/StatusViews";
import { ResumeAnalysisView } from "@/components/ResumeAnalysisView";
import { PageHeader, SectionCard } from "@/components/recruiter/DashboardUI";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AlertTriangle, Upload } from "lucide-react";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

function ResumeInsights() {
  const searchParams = useSearchParams();
  const { applications, loading, error, refresh, profiles, loadProfiles } = useRecruiterData();
  const [selectedId, setSelectedId] = useState(searchParams.get("application") ?? "");
  const [analysing, setAnalysing] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);

  useEffect(() => {
    loadProfiles(applications.map((a) => a.applicant_id));
  }, [applications, loadProfiles]);

  const withResume = applications.filter((a) => a.resume);
  const selected = withResume.find((a) => String(a.application_id) === selectedId);

  const analyse = async (pdf: Blob) => {
    if (pdf.size > MAX_PDF_BYTES) {
      toast.error("Resume must be smaller than 5 MB");
      return;
    }
    const pdfBase64 = await fileToBase64(pdf);
    // Gemini is called by the utils service; no API key reaches the browser
    const { data } = await utilsApi.post<ResumeAnalysis>("/resume-analyser", { pdfBase64 });
    setResult(data);
  };

  const analyseSelected = async () => {
    if (!selected?.resume || analysing) return;
    setAnalysing(true);
    setResult(null);
    setFetchFailed(false);
    // Step 1: download the stored resume. Only this step offers the manual-upload fallback.
    let blob: Blob;
    try {
      const response = await fetch(selected.resume);
      if (!response.ok) throw new Error(`Resume download failed (${response.status})`);
      blob = await response.blob();
      if (!blob.type.includes("pdf")) throw new Error("The stored resume is not a PDF");
    } catch (err) {
      setFetchFailed(true);
      toast.error(getErrorMessage(err, "Could not download the resume"));
      setAnalysing(false);
      return;
    }

    // Step 2: send it to the analyser in the utils service
    try {
      await analyse(blob);
    } catch (err) {
      toast.error(getErrorMessage(err, "Resume analysis failed. Is the utils service running?"));
    } finally {
      setAnalysing(false);
    }
  };

  const analyseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || analysing) return;
    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }
    setAnalysing(true);
    setResult(null);
    try {
      await analyse(file);
      setFetchFailed(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not analyse this resume"));
    } finally {
      setAnalysing(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SectionCard title="Resume insights">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Runs a candidate&apos;s resume through the ATS analyser: formatting, keywords, structure and readability, with
          suggestions. It scores general ATS compatibility, not fit for a specific job.
        </p>
        {withResume.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications with a resume yet.</p>
        ) : (
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="ai-application">Candidate</Label>
              <Select
                id="ai-application"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setResult(null);
                  setFetchFailed(false);
                }}
              >
                <option value="">Choose an application...</option>
                {withResume.map((a) => (
                  <option key={a.application_id} value={a.application_id}>
                    {profiles[a.applicant_id]?.name || a.applicant_email} · {a.job_title}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="brand" onClick={analyseSelected} disabled={!selected} isLoading={analysing}>
              Analyse resume
            </Button>
          </div>
        )}

        {fetchFailed && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm space-y-3">
            <p>
              The browser couldn&apos;t load the stored resume. Cloudinary may be blocking PDF delivery, or the file isn&apos;t
              a PDF. Download it from the candidate page and upload it here instead.
            </p>
            <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 cursor-pointer hover:bg-accent focus-within:ring-2 focus-within:ring-ring">
              <Upload className="h-4 w-4 text-primary" />
              Upload PDF
              <input type="file" accept="application/pdf" className="sr-only" onChange={analyseUpload} />
            </label>
          </div>
        )}

        {analysing && <p className="text-sm text-muted-foreground animate-pulse">Analysing resume...</p>}
        {result && <ResumeAnalysisView result={result} />}
      </div>
    </SectionCard>
  );
}

export default function AiAssistantPage() {
  return (
    <>
      <PageHeader title="AI Hiring Assistant" description="Get ATS insights on a candidate's resume, powered by Gemini." />

      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="text-foreground">
          AI output is advisory and can be wrong or incomplete. It only sees the resume text, so use it as one input and
          make every hiring decision yourself. Resumes are sent to Google Gemini for analysis.
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <ResumeInsights />
      </Suspense>
    </>
  );
}
