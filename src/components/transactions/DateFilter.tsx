import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn, formatDayMonth } from "@/lib/utils";

export interface DateRange {
  /** ISO yyyy-MM-dd, or "" when unset. */
  from: string;
  to: string;
}

export const EMPTY_RANGE: DateRange = { from: "", to: "" };

export function hasRange(r: DateRange): boolean {
  return Boolean(r.from || r.to);
}

interface Preset {
  label: string;
  range: () => DateRange;
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
// Last day of a 1-based month.
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();
const month = (y: number, m: number): DateRange => ({
  from: iso(y, m, 1),
  to: iso(y, m, lastDay(y, m)),
});
const quarter = (y: number, q: number): DateRange => {
  const start = q * 3 - 2; // Q1 -> 1, Q2 -> 4, ...
  return { from: iso(y, start, 1), to: iso(y, start + 2, lastDay(y, start + 2)) };
};

function buildPresets(): Preset[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-based
  const prevMonthY = m === 1 ? y - 1 : y;
  const prevMonthM = m === 1 ? 12 : m - 1;
  return [
    { label: "Current month", range: () => month(y, m) },
    { label: "Previous month", range: () => month(prevMonthY, prevMonthM) },
    { label: "Current year", range: () => ({ from: iso(y, 1, 1), to: iso(y, 12, 31) }) },
    { label: "Previous year", range: () => ({ from: iso(y - 1, 1, 1), to: iso(y - 1, 12, 31) }) },
    { label: "Q1", range: () => quarter(y, 1) },
    { label: "Q2", range: () => quarter(y, 2) },
    { label: "Q3", range: () => quarter(y, 3) },
    { label: "Q4", range: () => quarter(y, 4) },
  ];
}

function rangeLabel(r: DateRange): string {
  if (r.from && r.to) return `${formatDayMonth(r.from)} – ${formatDayMonth(r.to)}`;
  if (r.from) return `From ${formatDayMonth(r.from)}`;
  if (r.to) return `Until ${formatDayMonth(r.to)}`;
  return "";
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const presets = buildPresets();
  const active = hasRange(value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const presetIsActive = (p: Preset) => {
    const r = p.range();
    return r.from === value.from && r.to === value.to;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            open || active
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>

        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_RANGE)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
            title="Clear date filter"
          >
            {rangeLabel(value)}
            <X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Date or timeframe</span>
            <button
              type="button"
              onClick={() => onChange(EMPTY_RANGE)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Clear
            </button>
          </div>

          <p className="mb-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            Timeframe
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.range())}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                  presetIsActive(p)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] hover:bg-[var(--color-surface-2)]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
              From
              <input
                type="date"
                value={value.from}
                max={value.to || undefined}
                onChange={(e) => onChange({ ...value, from: e.target.value })}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-2 text-sm text-[var(--color-text)] outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
              To
              <input
                type="date"
                value={value.to}
                min={value.from || undefined}
                onChange={(e) => onChange({ ...value, to: e.target.value })}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-2 text-sm text-[var(--color-text)] outline-none"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
