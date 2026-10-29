"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronRight, Home, Menu, Plus, Search } from "lucide-react";
import { getBreadcrumbs } from "./navigation";

// Account, settings and logout live in the sidebar footer, so the top bar stays task-focused
export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const crumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") searchRef.current?.blur();
      // Cmd/Ctrl+K or "/" focuses search, unless the user is already typing somewhere
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    searchRef.current?.blur();
    router.push(q ? `/dashboard/applicants?q=${encodeURIComponent(q)}` : "/dashboard/applicants");
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden -ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1 lg:flex-none lg:w-64">
          <ol className="flex items-center gap-1.5 text-sm">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={crumb.label} className="flex min-w-0 items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
                  {crumb.href && !last ? (
                    <Link href={crumb.href} className="truncate text-muted-foreground hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate font-semibold text-foreground" aria-current={last ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} role="search" className="hidden md:block flex-1 max-w-md mx-auto">
          <label className="group relative block">
            <span className="sr-only">Search applicants by name or skill</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applicants, skills..."
              className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-14 text-sm placeholder:text-muted-foreground transition-colors focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground group-focus-within:hidden">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </label>
        </form>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Link href="/dashboard/applicants" className="md:hidden" aria-label="Search applicants">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Back to the main site */}
          <Link href="/" aria-label="Home">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>

          {pathname !== "/dashboard/post-job" && (
            <Link href="/dashboard/post-job" className="hidden sm:block">
              <Button variant="brand" size="sm" className="gap-1.5 h-9">
                <Plus className="h-4 w-4" />
                New job
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
