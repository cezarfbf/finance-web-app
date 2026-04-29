import { useParams, Link, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BUSINESS_NAME,
  findBusinessReport,
} from "@/data/businessReports";

const MONTH_LABELS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/**
 * Detail view of a single monthly business report. Mirrors the layout of
 * the original `relatorio_contabil_<mes><ano>.html` files but reads from
 * the static dataset in `@/data/businessReports`.
 */
export function BusinessReportDetail() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const y = Number(year);
  const m = Number(month);

  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return <Navigate to="/business" replace />;
  }

  const report = findBusinessReport(y, m);

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to="/business"
        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ← Back to Business
      </Link>

      <h1 className="mt-2 text-2xl font-semibold">
        {MONTH_LABELS_PT[m - 1]} {y}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {BUSINESS_NAME}
        {report?.motorVersion ? ` · Motor ${report.motorVersion}` : ""}
        {report
          ? ` · ${report.totalProcessed} transações processadas · ${report.unclassified} não classificados`
          : ""}
      </p>

      {!report && (
        <Card className="mt-6 p-8 text-center text-sm text-[var(--color-text-muted)]">
          No data for {MONTH_LABELS_PT[m - 1]} {y}.
        </Card>
      )}

      {report && (
        <>
          <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              label="Receita"
              value={report.kpis.receita}
              color="var(--kpi-receita)"
              icon="💰"
            />
            <KpiCard
              label="IVA Apurado"
              value={report.kpis.ivaApurado}
              color="var(--kpi-iva-apurado)"
              icon="📋"
            />
            <KpiCard
              label="IVA Pago"
              value={report.kpis.ivaPago}
              color="var(--kpi-iva-pago)"
              icon="💸"
            />
            <KpiCard
              label="Custos Oper."
              value={report.kpis.custosOperacionais}
              color="var(--kpi-custos)"
              icon="🔧"
            />
            <KpiCard
              label="Retiradas"
              value={report.kpis.retiradas}
              color="var(--kpi-retiradas)"
              icon="💼"
            />
            <KpiCard
              label="Gastos Pessoais"
              value={report.kpis.gastosPessoais}
              color="var(--kpi-pessoais)"
              icon="🛒"
            />
          </section>

          <h2 className="mt-8 mb-3 text-base font-semibold">
            Detalhe de transações
          </h2>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Contraparte</th>
                  <th className="px-4 py-3 text-left">Referência</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-left">Classificação</th>
                </tr>
              </thead>
              <tbody>
                {report.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3">{tx.counterparty}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {tx.reference}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {tx.category}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap"
                      style={{
                        color:
                          tx.classification === "Receita"
                            ? "var(--kpi-receita)"
                            : tx.classification === "IVA Apurado"
                              ? "var(--kpi-iva-apurado)"
                              : tx.classification === "IVA Pago"
                                ? "var(--kpi-iva-pago)"
                                : tx.classification === "Custos Oper."
                                  ? "var(--kpi-custos)"
                                  : tx.classification === "Retiradas"
                                    ? "var(--kpi-retiradas)"
                                    : tx.classification === "Gastos Pessoais"
                                      ? "var(--kpi-pessoais)"
                                      : "var(--color-text-muted)",
                      }}
                    >
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge classification={tx.classification} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
