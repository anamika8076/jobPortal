import { LayoutDashboard, Building2, PlusCircle, Briefcase, Users, FileSearch, BarChart3 } from "lucide-react";
import type { ShellConfig } from "@/components/shell/config";

export const RECRUITER_SHELL: ShellConfig = {
  homeHref: "/dashboard",
  navLabel: "Recruiter navigation",
  roleLabel: "Recruiter",
  nav: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/company", label: "Company Profile", icon: Building2 },
    { href: "/dashboard/post-job", label: "Post a Job", icon: PlusCircle },
    { href: "/dashboard/jobs", label: "Manage Jobs", icon: Briefcase },
    { href: "/dashboard/applicants", label: "Applicants", icon: Users },
    { href: "/dashboard/ai", label: "AI Hiring Assistant", icon: FileSearch },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ],
  settingsHref: "/dashboard/settings",
  detailLabels: {
    "/dashboard/applicants": "Candidate",
    "/dashboard/jobs": "Edit job",
    "/dashboard/company": "Company",
  },
  search: { placeholder: "Search applicants, skills...", path: "/dashboard/applicants", param: "q" },
  primaryAction: { href: "/dashboard/post-job", label: "New job" },
};
