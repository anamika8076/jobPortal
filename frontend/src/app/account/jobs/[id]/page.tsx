"use client";

import { useParams } from "next/navigation";
import { JobDetail } from "@/components/JobDetail";

export default function AccountJobDetailPage() {
  const params = useParams();
  return <JobDetail jobId={params?.id as string} backHref="/account/jobs" embedded />;
}
