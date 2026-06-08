import { coreApi } from "./client";
import type { Transaction } from "@/types/transaction";

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await coreApi.get<Transaction[]>("/transactions");
  return data;
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
