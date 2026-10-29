"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { utilsApi, getErrorMessage } from "@/lib/api";
import { cn, fileToBase64 } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ResumeAnalysis } from "@/types";
import { ResumeAnalysisView } from "@/components/ResumeAnalysisView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
type Source = "saved" | "upload";

// ATS check via POST /api/utils/resume-analyser, using the saved profile resume or an uploaded PDF
export function ResumeChecker() {
  const { user } = useAuth();
  const hasSaved = Boolean(user?.resume);
  const [source, setSource] = useState<Source>(hasSaved ? "saved" : "upload");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (selected && selected.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }
    if (selected && selected.size > MAX_PDF_BYTES) {
      toast.error("Resume must be smaller than 5 MB");
      return;
    }
    setFile(selected);
  };

  const handleAnalyse = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    let pdf: Blob;
    try {
      if (source === "saved") {
        const response = await fetch(user!.resume!);
        if (!response.ok) throw new Error(`Couldn't download your saved resume (${response.status})`);
        pdf = await response.blob();
        if (!pdf.type.includes("pdf")) throw new Error("Your saved resume isn't a PDF. Upload a PDF instead.");
      } else {
        if (!file) throw new Error("Choose a PDF first");
        pdf = file;
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't read the resume"));
      setLoading(false);
      return;
    }

    try {
      const pdfBase64 = await fileToBase64(pdf);
      const { data } = await utilsApi.post<ResumeAnalysis>("/resume-analyser", { pdfBase64 });
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Resume analysis failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const canAnalyse = source === "saved" ? hasSaved : Boolean(file);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Which resume?</CardTitle>
          <CardDescription>PDF only, up to 5 MB. Uploaded files are only used for this check and aren&apos;t saved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div role="radiogroup" aria-label="Resume source" className="grid gap-3 sm:grid-cols-2">
            {(["saved", "upload"] as Source[]).map((option) => {
              const disabled = option === "saved" && !hasSaved;
              const selected = source === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => {
                    setSource(option);
                    setResult(null);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    selected ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                  )}
                >
                  {option === "saved" ? <FileText className="h-5 w-5 text-primary mt-0.5" /> : <Upload className="h-5 w-5 text-primary mt-0.5" />}
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {option === "saved" ? "My saved resume" : "Upload a different PDF"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option === "saved"
                        ? hasSaved
                          ? "The resume on your profile"
                          : "You haven't uploaded one yet"
                        : "Try a new version before saving it"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {source === "upload" && (
            <label className="flex items-center gap-3 rounded-lg border border-dashed border-input px-4 py-3 cursor-pointer hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm truncate">{file ? file.name : "Choose a PDF..."}</span>
              <input type="file" accept="application/pdf" className="sr-only" onChange={handleFile} />
            </label>
          )}

          {!hasSaved && (
            <p className="text-xs text-muted-foreground">
              Want to check your profile resume?{" "}
              <Link href="/account/profile" className="text-primary hover:underline">
                Upload it on your profile
              </Link>{" "}
              first.
            </p>
          )}

          <Button onClick={handleAnalyse} disabled={!canAnalyse} isLoading={loading}>
            Check resume
          </Button>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground animate-pulse">Checking your resume. This can take up to a minute...</p>}
      {result && <ResumeAnalysisView result={result} />}
    </div>
  );
}
