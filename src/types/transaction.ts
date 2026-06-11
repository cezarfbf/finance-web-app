export interface Category {
  id: string;
  name: string;
  context: "PERSONAL" | "BUSINESS";
  icon: string | null;
  color: string | null;
  code: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  context: "PERSONAL" | "BUSINESS";
  date: string;
  amount: number;
  currency: string;
  type: "DEBIT" | "CREDIT";
  category: Category | null;
  counterparty: string | null;
  externalReference: string | null;
  description: string | null;
  notes: string | null;
  source: "MANUAL" | "IMPORT" | "BANK_SYNC";
}

/** Create/update payload for a transaction. */
export interface TransactionInput {
  context: "PERSONAL" | "BUSINESS";
  /** ISO yyyy-MM-dd. */
  date: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  categoryId?: string | null;
  currency?: string;
  description: string;
  counterparty?: string | null;
  notes?: string | null;
}

/**
 * Accounting classification labels used in business monthly reports.
 * Matches the KPI colour tokens defined in index.css.
 */
export type Classification =
  | "Receita"
  | "IVA Apurado"
  | "IVA Pago"
  | "Custos Oper."
  | "Retiradas"
  | "Gastos Pessoais"
  | "IGNORAR";
