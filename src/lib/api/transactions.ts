import { coreApi } from "./client";
import type { Transaction, TransactionInput } from "@/types/transaction";

export async function fetchTransactions(
  context?: "PERSONAL" | "BUSINESS",
): Promise<Transaction[]> {
  const { data } = await coreApi.get<Transaction[]>(
    "/transactions",
    context ? { params: { context } } : undefined,
  );
  return data;
}

export interface TransactionFilters {
  context: "PERSONAL" | "BUSINESS";
  q?: string;
  /** Inclusive start date, ISO yyyy-MM-dd. */
  from?: string;
  /** Inclusive end date, ISO yyyy-MM-dd. */
  to?: string;
}

export async function searchTransactions(
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const { context, q, from, to } = filters;
  const { data } = await coreApi.get<Transaction[]>("/transactions/search", {
    params: {
      context,
      ...(q ? { q } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  });
  return data;
}

export async function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const { data } = await coreApi.post<Transaction>("/transactions", input);
  return data;
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<Transaction> {
  const { data } = await coreApi.put<Transaction>(`/transactions/${id}`, input);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await coreApi.delete(`/transactions/${id}`);
}

export async function fetchMonthlyTransactions(
  year: number,
  month: number,
  context?: "PERSONAL" | "BUSINESS",
): Promise<Transaction[]> {
  const { data } = await coreApi.get<Transaction[]>(
    `/transactions/${year}/${month}`,
    context ? { params: { context } } : undefined,
  );
  return data;
}
