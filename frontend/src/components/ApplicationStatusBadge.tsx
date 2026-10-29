import React from "react";
import { ApplicationStatus } from "@/types";
import { Badge, BadgeProps } from "./ui/badge";

const statusVariant: Record<ApplicationStatus, BadgeProps["variant"]> = {
  Submitted: "info",
  Rejected: "destructive",
  Hired: "success",
};

// How each backend status reads to the candidate
export const SEEKER_STATUS_LABEL: Record<ApplicationStatus, string> = {
  Submitted: "Under review",
  Hired: "Hired",
  Rejected: "Not selected",
};

export function ApplicationStatusBadge({
  status,
  className,
  label,
}: {
  status: ApplicationStatus;
  className?: string;
  label?: string;
}) {
  return (
    <Badge variant={statusVariant[status] ?? "secondary"} className={className}>
      {label ?? status}
    </Badge>
  );
}
