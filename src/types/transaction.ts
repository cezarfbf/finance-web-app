/**
 * Categories observed in the reference monthly report (relatorio_contabil_*.html).
 * Backend may return additional values — keep this open via `string` fallback in code.
 */
export type TransactionCategory =
  | "foodAndDrink"
  | "taxAndSocialSecurity"
  | "salaries"
  | "fees"
  | "utilities"
  | "servicesAndSoftware"
  | "furnitureAndOfficeSupplies"
  | "other";

/**
 * Accounting classification used to roll up the monthly KPIs.
 * Mirrors the colored pills in the reference report.
 */
export type Classification =
  | "Receita"
  | "IVA Apurado"
  | "IVA Pago"
  | "Custos Oper."
  | "Retiradas"
  | "Gastos Pessoais"
  | "IGNORAR";

export interface Transaction {
  id: number | string;
  date: string;          // ISO 8601
  counterparty: string;  // "Contraparte"
  reference: string;     // "Referência"
  category: TransactionCategory | string;
  amount: number;        // EUR; negative = debit
  classification: Classification;
  /** Free-text description from the legacy /transactions endpoint. Optional. */
  description?: string;
}
