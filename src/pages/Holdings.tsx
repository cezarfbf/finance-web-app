import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

/**
 * Portfolio composition view — modeled after the second Wealthfolio screenshot.
 * Charts are stubbed; the structure is ready for real data.
 */
export function Holdings() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex items-center gap-2 text-sm">
        <Pill active>Holdings</Pill>
        <Pill>Performance</Pill>
        <Pill>Income</Pill>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Balance</CardTitle>
        </CardHeader>
        <div className="text-2xl font-semibold tabular-nums">€ 0,00</div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DistributionCard title="Currency" subtitle="Across portfolio" />
        <DistributionCard title="Accounts" subtitle="By balance" />
        <DistributionCard title="Classes" subtitle="Asset class" />
        <DistributionCard title="Regions" subtitle="Geographic" />
      </div>
    </div>
  );
}

function DistributionCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="flex h-40 items-center justify-center text-sm text-[var(--color-text-muted)]">
        {subtitle}
      </div>
    </Card>
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
