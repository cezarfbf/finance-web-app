import { coreApi } from './client';
import type { MonthlyReport, MonthlyReportSummary } from '@/types/report';

export async function fetchMonthlyReportSummaries(
  year: number,
): Promise<MonthlyReportSummary[]> {
  const { data } = await coreApi.get<MonthlyReportSummary[]>(
    '/reports/monthly',
    { params: { year } },
  );
  return data;
}

export async function fetchMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const { data } = await coreApi.get<MonthlyReport>(
    `/reports/monthly/${year}/${month}`,
  );
  return data;
}
