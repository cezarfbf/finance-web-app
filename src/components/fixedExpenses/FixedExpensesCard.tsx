import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { fetchFixedExpenses } from "@/lib/api/fixedExpenses";
import type { FixedExpense } from "@/types/fixedExpense";
import { formatCurrency, cn } from "@/lib/utils";
import { FixedExpenseFormModal } from "./FixedExpenseFormModal";

const PALETTE = [
  "#2980b9", "#00b894", "#e67e22", "#f39c12",
  "#8e44ad", "#e74c3c", "#636e72", "#f0a868",
  "#00cec9", "#fd79a8",
];

function expenseColor(expense: FixedExpense, idx: number): string {
  return expense.category?.color ?? PALETTE[idx % PALETTE.length];
}

export function FixedExpensesCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ["fixed-expenses"],
    queryFn: () => fetchFixedExpenses("PERSONAL"),
  });

  const expenses = useMemo(() => data ?? [], [data]);
  const monthlyTotal = useMemo(
    () => expenses.filter((e) => e.active).reduce((s, e) => s + e.amount, 0),
    [expenses],
  );

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (expense: FixedExpense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  return (
    <div className="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Fixed Expenses</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatCurrency(monthlyTotal)}
            <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">/mo</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          aria-label="Add fixed expense"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">Loading…</p>
      )}

      {error && (
        <p className="py-6 text-center text-sm text-[var(--kpi-custos)]">
          Could not load fixed expenses.
        </p>
      )}

      {data && expenses.length === 0 && (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          No fixed expenses yet. Add what you pay every month.
        </p>
      )}

      {expenses.length > 0 && (
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {expenses.map((expense, i) => (
            <li key={expense.id}>
              <button
                type="button"
                onClick={() => openEdit(expense)}
                className={cn(
                  "flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-2)]",
                  !expense.active && "opacity-50",
                )}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: expenseColor(expense, i) }}
                />
                <span className="min-w-0 flex-1 truncate">
                  {expense.name}
                  {!expense.active && (
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">(inactive)</span>
                  )}
                </span>
                <span className="flex-shrink-0 text-xs text-[var(--color-text-muted)]">
                  day {expense.billingDay}
                </span>
                <span className="flex-shrink-0 font-semibold tabular-nums">
                  {formatCurrency(expense.amount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <FixedExpenseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editing ? "edit" : "create"}
        expense={editing}
      />
    </div>
  );
}
