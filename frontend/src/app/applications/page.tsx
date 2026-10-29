"use client";

import { RoleRedirect } from "@/components/RoleRedirect";

const TARGETS = { jobseeker: "/account/applications", recruiter: "/dashboard/applicants" } as const;

export default function ApplicationsRedirect() {
  return <RoleRedirect to={TARGETS} />;
}
