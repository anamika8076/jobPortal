import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  FileSearch,
  BarChart3,
  LucideIcon,
} from "lucide-react";

export interface RecruiterNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const RECRUITER_NAV: RecruiterNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/company", label: "Company Profile", icon: Building2 },
  { href: "/dashboard/post-job", label: "Post a Job", icon: PlusCircle },
  { href: "/dashboard/jobs", label: "Manage Jobs", icon: Briefcase },
  { href: "/dashboard/applicants", label: "Applicants", icon: Users },
  { href: "/dashboard/ai", label: "AI Hiring Assistant", icon: FileSearch },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

// Breadcrumb trail for the top bar, e.g. Applicants / Candidate (the last crumb is the current page)
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  // Settings sits in the sidebar footer rather than the main nav
  const match = [...RECRUITER_NAV, { href: "/dashboard/settings", label: "Settings" }]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isNavActive(pathname, item.href));
  if (!match || match.href === "/dashboard") return [{ label: "Overview" }];
  if (pathname === match.href) return [{ label: match.label }];

  const detail: Record<string, string> = {
    "/dashboard/applicants": "Candidate",
    "/dashboard/jobs": "Edit job",
    "/dashboard/company": "Company",
  };
  return [{ label: match.label, href: match.href }, { label: detail[match.href] ?? "Details" }];
}
