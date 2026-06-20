import { coreApi } from "./client";
import type { FixedExpense, FixedExpenseInput } from "@/types/fixedExpense";

export async function fetchFixedExpenses(
  context?: "PERSONAL" | "BUSINESS",
): Promise<FixedExpense[]> {
  const { data } = await coreApi.get<FixedExpense[]>(
    "/fixed-expenses",
    context ? { params: { context } } : undefined,
  );
  return data;
}

export async function createFixedExpense(
  input: FixedExpenseInput,
): Promise<FixedExpense> {
  const { data } = await coreApi.post<FixedExpense>("/fixed-expenses", input);
  return data;
}

export async function updateFixedExpense(
  id: string,
  input: FixedExpenseInput,
): Promise<FixedExpense> {
  const { data } = await coreApi.put<FixedExpense>(`/fixed-expenses/${id}`, input);
  return data;
}

export async function deleteFixedExpense(id: string): Promise<void> {
  await coreApi.delete(`/fixed-expenses/${id}`);
}
