import type { LucideIcon } from "lucide-react";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Describes one signed-in area (recruiter dashboard, job seeker account) rendered by AppShell
export interface ShellConfig {
  homeHref: string;
  navLabel: string;
  roleLabel: string;
  nav: ShellNavItem[];
  settingsHref: string;
  // Breadcrumb label for detail pages under a nav item, e.g. "/dashboard/applicants" -> "Candidate"
  detailLabels?: Record<string, string>;
  search: { placeholder: string; path: string; param: string };
  primaryAction?: { href: string; label: string };
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export function isNavActive(pathname: string, href: string, homeHref: string): boolean {
  if (href === homeHref) return pathname === homeHref;
  return pathname === href || pathname.startsWith(href + "/");
}

// The last crumb is the current page
export function getBreadcrumbs(pathname: string, config: ShellConfig): Breadcrumb[] {
  // Settings sits in the sidebar footer rather than the main nav
  const match = [...config.nav, { href: config.settingsHref, label: "Settings" }]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isNavActive(pathname, item.href, config.homeHref));
  if (!match || match.href === config.homeHref) return [{ label: "Overview" }];
  if (pathname === match.href) return [{ label: match.label }];
  return [{ label: match.label, href: match.href }, { label: config.detailLabels?.[match.href] ?? "Details" }];
}
