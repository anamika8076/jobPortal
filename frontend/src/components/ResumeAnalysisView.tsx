import React from "react";
import { cn } from "@/lib/utils";
import { ResumeAnalysis } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge, BadgeProps } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

const priorityVariant: Record<string, BadgeProps["variant"]> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

// Renders the JSON returned by POST /api/utils/resume-analyser
export function ResumeAnalysisView({ result }: { result: ResumeAnalysis }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="text-center md:w-40 shrink-0">
            <p className={cn("text-6xl font-extrabold", scoreColor(result.atsScore))}>{result.atsScore}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">ATS score</p>
          </div>
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {result.scoreBreakdown &&
          Object.entries(result.scoreBreakdown).map(([key, detail]) => (
            <Card key={key}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold capitalize">{key}</p>
                  <p className={cn("text-xl font-bold", scoreColor(detail.score))}>{detail.score}</p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, detail.score)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{detail.feedback}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {result.strengths?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {result.strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.suggestions?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Suggestions</h2>
          {result.suggestions.map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={priorityVariant[s.priority] ?? "secondary"} className="capitalize">
                    {s.priority}
                  </Badge>
                  <span className="font-semibold">{s.category}</span>
                </div>
                <p className="text-muted-foreground">{s.issue}</p>
                <p>{s.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
