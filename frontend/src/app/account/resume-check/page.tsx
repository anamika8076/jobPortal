"use client";

import { ResumeChecker } from "@/components/seeker/ResumeChecker";
import { PageHeader } from "@/components/shell/DashboardUI";

export default function ResumeCheckPage() {
  return (
    <>
      <PageHeader
        title="Resume Check"
        description="See how well your resume reads in applicant tracking systems, with specific fixes. Results are AI-generated, so treat them as suggestions."
      />
      <ResumeChecker />
    </>
  );
}
