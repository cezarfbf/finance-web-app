import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { fetchPersonalMonthly } from "@/lib/api/personal";

const MONTH_LABELS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const PALETTE = [
  "#2980b9", "#00b894", "#e67e22", "#f39c12",
  "#8e44ad", "#e74c3c", "#636e72", "#f0a868",
  "#00cec9", "#fd79a8",
];

const CATEGORY_COLORS: Record<string, string> = {
  house_rental: "#2980b9",
  internet:     "#00b894",
  gym:          "#e67e22",
  insurance:    "#f39c12",
  church:       "#8e44ad",
  care:         "#fd79a8",
  loan:         "#e74c3c",
};

function categoryColor(cat: string, idx: number): string {
  return CATEGORY_COLORS[cat] ?? PALETTE[idx % PALETTE.length];
}

function formatCategory(raw: string): string {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["personal-monthly", year, month],
    queryFn: () => fetchPersonalMonthly(year, month),
  });

  const totalExpenses = data?.summary?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const net = -totalExpenses; // no income data yet

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <span className="text-sm text-[var(--color-accent)]">
          {MONTH_LABELS_PT[month - 1]} {year}
        </span>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">
          A carregar…
        </p>
      )}
      {error && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-5 text-sm text-[var(--kpi-custos)]">
          Não foi possível ligar ao finance-core-service (
          <code className="text-xs">{import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8080"}</code>
          ).
        </div>
      )}

      {data && (
        <>
          {/* Expenses card — full width */}
          <div className="rounded-2xl bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Gastos</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {formatCurrency(totalExpenses)}
            </p>

            {/* Segmented bar */}
            {totalExpenses > 0 && (
              <>
                <div className="mt-5 flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  {data.summary.map((row, i) => (
                    <div
                      key={row.category}
                      style={{
                        width: `${(row.amount / totalExpenses) * 100}%`,
                        background: categoryColor(row.category, i),
                      }}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {data.summary.map((row, i) => (
                    <div key={row.category} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: categoryColor(row.category, i) }}
                      />
                      {formatCategory(row.category)}
                    </div>
                  ))}
                </div>
              </>
            )}

            {totalExpenses === 0 && (
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                Sem gastos registados este mês.
              </p>
            )}
          </div>

          {/* Rendimento + Fluxo líquido */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rendimento */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">Rendimento</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatCurrency(0)}
              </p>
              {/* Placeholder bars */}
              <div className="mt-4 flex h-8 items-end gap-0.5">
                {[30, 30, 30, 30, 30, 30, 30, 30].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[var(--color-surface-2)]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Fluxo líquido */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">Fluxo líquido</p>
              <p
                className="mt-1 text-3xl font-semibold tabular-nums"
                style={{ color: net < 0 ? "var(--kpi-custos)" : "var(--kpi-receita)" }}
              >
                {formatCurrency(net)}
              </p>
              <p
                className="mt-1 flex items-center gap-1.5 text-xs"
                style={{ color: net < 0 ? "var(--kpi-custos)" : "var(--kpi-receita)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: net < 0 ? "var(--kpi-custos)" : "var(--kpi-receita)" }}
                />
                {net < 0 ? "Negativo" : "Positivo"}
              </p>
              {/* Income vs expenses bar */}
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 rounded-full bg-[var(--color-surface-2)]" />
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: "100%",
                    background: net < 0 ? "var(--kpi-custos)" : "var(--kpi-receita)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {data.summary.length > 0 && (
            <div className="rounded-2xl bg-[var(--color-surface)] p-5">
              <p className="mb-4 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Por categoria
              </p>
              <div className="space-y-3">
                {data.summary.map((row, i) => {
                  const color = categoryColor(row.category, i);
                  const pct = totalExpenses > 0 ? (row.amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={row.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                          <span>{formatCategory(row.category)}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{formatCurrency(row.amount)}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-[var(--color-surface-2)]">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
