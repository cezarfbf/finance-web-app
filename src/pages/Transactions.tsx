import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import {
  fetchTransactions,
  searchTransactions,
} from "@/lib/api/transactions";
import {
  DateFilter,
  EMPTY_RANGE,
  hasRange,
  type DateRange,
} from "@/components/transactions/DateFilter";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDayMonth } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

export function Transactions() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [range, setRange] = useState<DateRange>(EMPTY_RANGE);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    tx?: Transaction;
  } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const query = debouncedSearch.trim();
  const filtered = Boolean(query) || hasRange(range);
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", "PERSONAL", query, range.from, range.to],
    queryFn: () =>
      filtered
        ? searchTransactions({
            context: "PERSONAL",
            q: query || undefined,
            from: range.from || undefined,
            to: range.to || undefined,
          })
        : fetchTransactions("PERSONAL"),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New transaction
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DateFilter value={range} onChange={setRange} />
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
        <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading && <Empty>Loading…</Empty>}
        {error && (
          <Empty error>
            Could not reach finance-core-service. Is it running on{" "}
            <code className="rounded bg-[var(--color-surface-2)] px-1">
              {import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8080"}
            </code>
            ?
          </Empty>
        )}
        {data && data.length === 0 && (
          <Empty>
            {filtered
              ? "No transactions match your filters."
              : "No transactions yet."}
          </Empty>
        )}
        {data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setModal({ mode: "edit", tx })}
                  className="cursor-pointer border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDayMonth(tx.date)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.description ?? tx.counterparty ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color:
                          tx.type === "CREDIT"
                            ? "var(--kpi-receita)"
                            : "var(--kpi-custos)",
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <Badge label={tx.category.name} />
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <TransactionFormModal
        open={!!modal}
        mode={modal?.mode ?? "create"}
        transaction={modal?.tx}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

function Empty({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div
      className={
        "p-8 text-center text-sm " +
        (error ? "text-[var(--kpi-custos)]" : "text-[var(--color-text-muted)]")
      }
    >
      {children}
    </div>
  );
}
