import React from "react";
import { ApplicationStatus } from "@/types";
import { Badge, BadgeProps } from "./ui/badge";

const statusVariant: Record<ApplicationStatus, BadgeProps["variant"]> = {
  Submitted: "info",
  Rejected: "destructive",
  Hired: "success",
};

export function ApplicationStatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "secondary"} className={className}>
      {status}
    </Badge>
  );
}
