import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/lib/api/transactions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * Live view of GET /transactions on finance-core-service.
 * Shows the wired backend connection working end-to-end.
 */
export function Transactions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-semibold">Transactions</h1>

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
        {data && data.length === 0 && <Empty>No transactions yet.</Empty>}
        {data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Counterparty</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Classification</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50"
                >
                  <td className="px-4 py-3">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3">{tx.counterparty}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {tx.reference}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {tx.category}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge classification={tx.classification} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
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
