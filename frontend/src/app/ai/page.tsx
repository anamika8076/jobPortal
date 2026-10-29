"use client";

import { RoleRedirect } from "@/components/RoleRedirect";

const TARGETS = { jobseeker: "/account/resume-check", recruiter: "/dashboard/ai" } as const;

export default function AiRedirect() {
  return <RoleRedirect to={TARGETS} />;
}
