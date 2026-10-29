"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums">{value}</p>
        </div>
        <span className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-5 md:p-6", className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

export interface ChartDatum {
  label: string;
  value: number;
}

// Single-series color = the theme primary (#4f46b8 light / #8b83f0 dark), validated against both surfaces
const SERIES_BAR = "bg-primary";

function DataTable({ data, valueLabel }: { data: ChartDatum[]; valueLabel: string }) {
  return (
    <table className="mt-4 w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <th className="py-1.5 font-medium">Label</th>
          <th className="py-1.5 font-medium text-right">{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label} className="border-t border-border">
            <td className="py-1.5">{d.label}</td>
            <td className="py-1.5 text-right tabular-nums">{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
    >
      {shown ? "Hide table" : "View as table"}
    </button>
  );
}

export function ColumnChart({
  data,
  valueLabel,
  ariaLabel,
}: {
  data: ChartDatum[];
  valueLabel: string;
  ariaLabel: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.value));
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const labelEvery = data.length > 8 ? Math.ceil(data.length / 6) : 1;

  return (
    <div>
      <div className="relative h-48" role="img" aria-label={ariaLabel}>
        {/* recessive gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-dashed border-border/70" />
          ))}
        </div>
        <div className="relative flex h-full items-end gap-[2px]">
          {data.map((d, i) => (
            <div
              key={d.label}
              className="relative flex-1 h-full flex items-end"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-opacity",
                  SERIES_BAR,
                  hovered !== null && hovered !== i && "opacity-40"
                )}
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
              />
              {(hovered === i || (hovered === null && i === peakIndex && d.value > 0)) && (
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs pointer-events-none z-10",
                    hovered === i
                      ? "rounded-md border border-border bg-popover px-2 py-1 shadow-md -top-1 -translate-y-full"
                      : "font-semibold text-foreground"
                  )}
                  style={hovered === i ? undefined : { bottom: `calc(${(d.value / max) * 100}% + 4px)` }}
                >
                  {hovered === i ? (
                    <>
                      <span className="text-muted-foreground">{d.label}: </span>
                      <span className="font-semibold tabular-nums">{d.value}</span>
                    </>
                  ) : (
                    d.value
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-[2px] border-t border-border pt-1.5" aria-hidden>
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-muted-foreground truncate">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <TableToggle shown={showTable} onToggle={() => setShowTable((s) => !s)} />
      </div>
      {showTable && <DataTable data={data} valueLabel={valueLabel} />}
    </div>
  );
}

export function HorizontalBarChart({
  data,
  valueLabel,
  ariaLabel,
}: {
  data: ChartDatum[];
  valueLabel: string;
  ariaLabel: string;
}) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <ul className="space-y-2.5" aria-label={ariaLabel}>
        {data.map((d) => (
          <li key={d.label} className="grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 text-sm" title={`${d.label}: ${d.value}`}>
            <span className="truncate text-foreground">{d.label}</span>
            <div className="h-3 rounded-r-[4px] bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-r-[4px] transition-all duration-500", SERIES_BAR)}
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-right tabular-nums font-medium text-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <TableToggle shown={showTable} onToggle={() => setShowTable((s) => !s)} />
      </div>
      {showTable && <DataTable data={data} valueLabel={valueLabel} />}
    </div>
  );
}
