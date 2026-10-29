"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, Settings, X } from "lucide-react";
import { ShellConfig, isNavActive } from "./config";

interface SidebarProps {
  config: ShellConfig;
  mobileOpen: boolean;
  onClose: () => void;
}

const itemClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  );

function SidebarContent({ config, onNavigate }: { config: ShellConfig; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const settingsActive = pathname === config.settingsHref;

  return (
    <div className="flex h-full flex-col">
      <Link
        href={config.homeHref}
        onClick={onNavigate}
        className="flex items-center px-5 h-16 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Hirely ${config.roleLabel.toLowerCase()} home`}
      >
        <Logo />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={config.navLabel}>
        <ul className="space-y-1">
          {config.nav.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href, config.homeHref);
            return (
              <li key={href}>
                <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn(itemClass(active), "py-2.5")}>
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar src={user.profile_pic} fallbackText={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground truncate capitalize">{user.name}</p>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                  {config.roleLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Link
            href={config.settingsHref}
            onClick={onNavigate}
            aria-current={settingsActive ? "page" : undefined}
            className={cn(itemClass(settingsActive), "mt-1 w-full py-2")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ config, mobileOpen, onClose }: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card">
        <SidebarContent config={config} />
      </aside>

      {/* Mobile and tablet drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border shadow-xl animate-slide-in-left">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent config={config} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
