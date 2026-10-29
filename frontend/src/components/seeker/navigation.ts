import { LayoutDashboard, Search, ClipboardList, FileText, FileSearch, Compass } from "lucide-react";
import type { ShellConfig } from "@/components/shell/config";

export const SEEKER_SHELL: ShellConfig = {
  homeHref: "/account",
  navLabel: "Job seeker navigation",
  roleLabel: "Job seeker",
  nav: [
    { href: "/account", label: "Overview", icon: LayoutDashboard },
    { href: "/account/jobs", label: "Find Jobs", icon: Search },
    { href: "/account/applications", label: "My Applications", icon: ClipboardList },
    { href: "/account/profile", label: "Resume & Skills", icon: FileText },
    { href: "/account/resume-check", label: "Resume Check", icon: FileSearch },
    { href: "/account/career", label: "Career Advisor", icon: Compass },
  ],
  settingsHref: "/account/settings",
  detailLabels: { "/account/jobs": "Job details" },
  search: { placeholder: "Search jobs by title...", path: "/account/jobs", param: "search" },
};
