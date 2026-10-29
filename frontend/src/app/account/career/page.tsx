"use client";

import { CareerAdvisor } from "@/components/seeker/CareerAdvisor";
import { PageHeader } from "@/components/shell/DashboardUI";

export default function CareerPage() {
  return (
    <>
      <PageHeader
        title="Career Advisor"
        description="Roles that suit your skills and what to learn next. Suggestions are AI-generated, so use them as a starting point."
      />
      <CareerAdvisor />
    </>
  );
}
