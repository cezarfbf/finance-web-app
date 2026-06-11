import { coreApi } from "./client";
import type { Category } from "@/types/transaction";

export async function fetchCategories(
  context: "PERSONAL" | "BUSINESS",
): Promise<Category[]> {
  const { data } = await coreApi.get<Category[]>("/categories", {
    params: { context },
  });
  return data;
}
