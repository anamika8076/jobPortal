import React from "react";
import { cn } from "@/lib/utils";

// The Hirely mark: a lowercase "h" whose right leg doubles as a dotted "i" ("hi"),
// the dot also reading as a person. Colors come from the theme so it works in dark mode.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-9 w-9 shrink-0", className)} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M11 8.5v15M11 17.5a5 5 0 0 1 10 0v6"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="10" r="2" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  subtitle,
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Hirely
        {subtitle && <span className="ml-1.5 text-xs font-medium text-muted-foreground">{subtitle}</span>}
      </span>
    </span>
  );
}
