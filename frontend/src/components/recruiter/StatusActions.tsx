"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/api";
import { useRecruiterData } from "@/context/RecruiterDataContext";
import { ApplicationStatus, RecruiterApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

// Hire / Reject / reset buttons; the backend emails the candidate on every change
export function StatusActions({ application, size = "sm" }: { application: RecruiterApplication; size?: "sm" | "default" }) {
  const { updateApplicationStatus } = useRecruiterData();
  const [pending, setPending] = useState<ApplicationStatus | null>(null);

  const change = async (status: ApplicationStatus) => {
    if (pending) return;
    if (status === "Rejected" && !window.confirm("Reject this candidate? They will be notified by email.")) return;
    setPending(status);
    try {
      await updateApplicationStatus(application.application_id, status);
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the application"));
    } finally {
      setPending(null);
    }
  };

  if (application.status !== "Submitted") {
    return (
      <Button variant="ghost" size={size} className="gap-1.5" onClick={() => change("Submitted")} isLoading={pending === "Submitted"}>
        {pending !== "Submitted" && <RotateCcw className="h-4 w-4" />}
        Move back to review
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={size}
        className="gap-1.5 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400"
        onClick={() => change("Hired")}
        isLoading={pending === "Hired"}
        disabled={pending !== null}
      >
        {pending !== "Hired" && <CheckCircle2 className="h-4 w-4" />}
        Hire
      </Button>
      <Button
        variant="outline"
        size={size}
        className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
        onClick={() => change("Rejected")}
        isLoading={pending === "Rejected"}
        disabled={pending !== null}
      >
        {pending !== "Rejected" && <XCircle className="h-4 w-4" />}
        Reject
      </Button>
    </div>
  );
}
