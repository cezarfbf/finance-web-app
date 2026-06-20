import { FixedExpensesCard } from "@/components/fixedExpenses/FixedExpensesCard";

const MONTH_LABELS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <span className="text-sm text-[var(--color-accent)]">
          {MONTH_LABELS_EN[month - 1]} {year}
        </span>
      </div>

      <FixedExpensesCard />
    </div>
  );
}
