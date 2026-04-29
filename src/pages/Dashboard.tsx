import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatPercent } from "@/lib/utils";

/**
 * Investments / Net Worth overview — modeled after the first Wealthfolio
 * screenshot. Numbers are placeholders until backend endpoints land.
 */
export function Dashboard() {
  const totalValue = 0;
  const periodReturn = 0;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <div className="flex gap-2 text-sm">
          <Pill active>Investments</Pill>
          <Pill>Net Worth</Pill>
        </div>

        <div className="mt-6">
          <div className="text-3xl font-semibold tabular-nums">
            {formatCurrency(totalValue)}
          </div>
          <div className="mt-1 text-sm text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text)]">
              {formatPercent(periodReturn)}
            </span>{" "}
            past 3 months
          </div>
        </div>
      </header>

      <Card className="flex h-72 items-center justify-center text-[var(--color-text-muted)]">
        Performance chart — coming soon
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <p className="text-sm text-[var(--color-text-muted)]">
            No accounts yet. Connect to{" "}
            <code className="rounded bg-[var(--color-surface-2)] px-1 py-0.5 text-xs">
              finance-core-service
            </code>{" "}
            to populate.
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <p className="text-sm text-[var(--color-text-muted)]">No holdings yet.</p>
        </Card>
      </div>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-3 py-1 " +
        (active
          ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
          : "border-transparent text-[var(--color-text-muted)]")
      }
    >
      {children}
    </span>
  );
}
