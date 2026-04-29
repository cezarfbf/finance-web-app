import type { Transaction } from "./transaction";

export interface MonthlyKpis {
  receita: number;
  ivaApurado: number;
  ivaPago: number;
  custosOperacionais: number;
  retiradas: number;
  gastosPessoais: number;
}

export interface MonthlyReport {
  year: number;
  month: number;             // 1-12
  motorVersion?: string;     // "v1.0 + ajustes"
  totalProcessed: number;
  unclassified: number;
  kpis: MonthlyKpis;
  transactions: Transaction[];
}

export interface MonthlyReportSummary {
  year: number;
  month: number;
  totalProcessed: number;
  kpis: MonthlyKpis;
}
