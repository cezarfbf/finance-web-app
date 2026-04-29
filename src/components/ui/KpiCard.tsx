import { Card } from "./Card";
import { formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  /** CSS color string — usually a `var(--kpi-*)` token. */
  color?: string;
  icon?: string;
}

export function KpiCard({ label, value, color, icon }: KpiCardProps) {
  return (
    <Card className="min-w-[160px] flex-1">
      <div className="text-[0.72rem] uppercase tracking-wide text-[var(--color-text-muted)]">
        {icon ? <span className="mr-1">{icon}</span> : null}
        {label}
      </div>
      <div
        className="mt-2 text-xl font-bold tabular-nums"
        style={{ color: color ?? "inherit" }}
      >
        {formatCurrency(value)}
      </div>
    </Card>
  );
}
