import { coreApi } from "./client";
import type { PersonalMonthlyReport } from "@/types/personal";

export async function fetchPersonalMonthly(
  year: number,
  month: number,
): Promise<PersonalMonthlyReport> {
  const { data } = await coreApi.get<PersonalMonthlyReport>(
    `/personal/monthly/${year}/${month}`,
  );
  return data;
}
