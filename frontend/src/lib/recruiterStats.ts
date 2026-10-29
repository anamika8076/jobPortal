import { APPLICATION_STATUSES, ApplicationStatus, RecruiterApplication, RecruiterJob } from "@/types";
import type { ChartDatum } from "@/components/shell/DashboardUI";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

// Applications per week for the last `weeks` weeks, oldest first
export function applicationsByWeek(applications: RecruiterApplication[], weeks = 8): ChartDatum[] {
  const thisWeek = startOfWeek(new Date());
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(thisWeek.getTime() - (weeks - 1 - i) * 7 * DAY_MS);
    return { start, label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: 0 };
  });
  applications.forEach((a) => {
    if (!a.applied_at) return;
    const week = startOfWeek(new Date(a.applied_at)).getTime();
    const bucket = buckets.find((b) => b.start.getTime() === week);
    if (bucket) bucket.value += 1;
  });
  return buckets.map(({ label, value }) => ({ label, value }));
}

export function applicantCounts(applications: RecruiterApplication[]): Record<number, number> {
  return applications.reduce<Record<number, number>>((acc, a) => {
    acc[a.job_id] = (acc[a.job_id] ?? 0) + 1;
    return acc;
  }, {});
}

export function applicantsByJob(
  jobs: RecruiterJob[],
  applications: RecruiterApplication[],
  limit = 8
): ChartDatum[] {
  const counts = applicantCounts(applications);
  return jobs
    .map((j) => ({ label: j.title, value: counts[j.job_id] ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function statusCounts(applications: RecruiterApplication[]): Record<ApplicationStatus, number> {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  applications.forEach((a) => {
    if (a.status in counts) counts[a.status] += 1;
  });
  return counts;
}
