import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Briefcase, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { fetchMonthlyReportSummaries } from "@/lib/api/reports";
import { BUSINESS_NAME } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyReport } from "@/types/report";

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
 * Business area landing page — modeled after the "business account" tab in
 * banking apps (Revolut Business, N26 Business). The personal finance views
 * (Dashboard / Holdings / Transactions) live elsewhere in the sidebar.
 *
 * For now the only feature is the monthly accounting reports. Cards render
 * one tile per month that actually has data.
 */
export function Business() {
  const [year, setYear] = useState(2025);

  const { data: reportSummaries = [], isLoading, isError } = useQuery({
    queryKey: ['reports-monthly', year],
    queryFn: () => fetchMonthlyReportSummaries(year),
  });

  const years = useMemo(() => {
    const yearSet = new Set([2025]);
    reportSummaries.forEach((r) => yearSet.add(r.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [reportSummaries]);

  const reports = useMemo(
    () => reportSummaries.map((summary) => ({
      year: summary.year,
      month: summary.month,
      motorVersion: undefined,
      totalProcessed: summary.totalProcessed,
      unclassified: 0,
      kpis: summary.kpis,
      transactions: [],
    } as MonthlyReport)).filter((r) => r.year === year),
    [reportSummaries, year],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-2)] text-[var(--color-accent)]">
            <Briefcase size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Business</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {BUSINESS_NAME}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm">
          <Pill active>Reports</Pill>
          <Pill disabled>Invoices</Pill>
          <Pill disabled>Taxes</Pill>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Monthly results</h2>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <Card className="p-8 text-center text-sm text-[var(--kpi-custos)]">
          Não foi possível carregar os relatórios. Tente novamente mais tarde.
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-[var(--color-surface-2)]" />
          ))}
        </div>
      )}

      {!isLoading && reports.length === 0 && !isError && (
        <Card className="p-8 text-center text-sm text-[var(--color-text-muted)]">
          No reports yet for {year}.
        </Card>
      )}

      {!isLoading && reports.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={`${report.year}-${report.month}`} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: MonthlyReport }) {
  const monthLabel = MONTH_LABELS_PT[report.month - 1];
  const balance =
    report.kpis.receita -
    report.kpis.custosOperacionais -
    report.kpis.ivaPago;

  return (
    <Link to={`/business/${report.year}/${report.month}`}>
      <Card className="cursor-pointer transition-colors hover:bg-[var(--color-surface-2)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              {String(report.month).padStart(2, "0")} / {report.year}
            </div>
            <div className="mt-0.5 text-xl font-semibold">{monthLabel}</div>
          </div>
          <ArrowRight
            size={16}
            className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Mini
            label="Receita"
            value={report.kpis.receita}
            color="var(--kpi-receita)"
          />
          <Mini
            label="Custos Oper."
            value={report.kpis.custosOperacionais}
            color="var(--kpi-custos)"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
          <span>{report.totalProcessed} transações</span>
          <span className="tabular-nums">
            Saldo:{" "}
            <span
              className="font-semibold"
              style={{
                color:
                  balance >= 0 ? "var(--kpi-receita)" : "var(--kpi-custos)",
              }}
            >
              {formatCurrency(balance)}
            </span>
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Mini({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="text-[0.7rem] uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums" style={{ color }}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}

function Pill({
  children,
  active,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-3 py-1 " +
        (active
          ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
          : disabled
            ? "border-transparent text-[var(--color-text-muted)] opacity-50"
            : "border-transparent text-[var(--color-text-muted)]")
      }
    >
      {children}
    </span>
  );
}
