"use client";

import { RoleRedirect } from "@/components/RoleRedirect";

const TARGETS = { jobseeker: "/account/profile", recruiter: "/dashboard/settings" } as const;

export default function ProfileRedirect() {
  return <RoleRedirect to={TARGETS} />;
}
