import type { Category } from "./transaction";

export interface FixedExpense {
  id: string;
  userId: string;
  context: "PERSONAL" | "BUSINESS";
  name: string;
  amount: number;
  currency: string;
  category: Category | null;
  /** Day of month (1–31) the commitment falls due. */
  billingDay: number;
  active: boolean;
  notes: string | null;
}

/** Create/update payload for a fixed expense. */
export interface FixedExpenseInput {
  name: string;
  amount: number;
  categoryId?: string | null;
  currency?: string;
  billingDay: number;
  active?: boolean;
  notes?: string | null;
}
