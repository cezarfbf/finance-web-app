import { coreApi } from "./client";
import type { Transaction } from "@/types/transaction";

/**
 * GET /transactions — finance-core-service.
 *
 * The current backend stub returns a minimal shape ({id, description, amount}).
 * We tolerate that and synthesize sensible defaults until the backend is
 * extended with date / counterparty / classification fields.
 */
export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await coreApi.get<Array<Partial<Transaction> & { description?: string }>>(
    "/transactions",
  );

  return data.map((row, idx) => ({
    id: row.id ?? idx,
    date: row.date ?? new Date().toISOString(),
    counterparty: row.counterparty ?? row.description ?? "—",
    reference: row.reference ?? "",
    category: row.category ?? "other",
    amount: typeof row.amount === "number" ? row.amount : 0,
    classification: row.classification ?? "IGNORAR",
    description: row.description,
  }));
}
