export interface PersonalExpenseSummary {
  category: string;
  type: "FIXED" | "VARIABLE";
  amount: number;
}

export interface PersonalExpense {
  id: number;
  date: string;
  category: string;
  type: "FIXED" | "VARIABLE";
  amount: number;
  description: string;
}

export interface PersonalMonthlyReport {
  year: number;
  month: number;
  summary: PersonalExpenseSummary[];
  expenses: PersonalExpense[];
}
