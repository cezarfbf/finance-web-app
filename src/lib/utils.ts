import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  // dd-MM-yyyy to match the reference report style
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatDayMonth(iso: string): string {
  // Current year: "4 June" (day + full month, no year).
  // Earlier years: "23 Dec 2025" (day + short month + year).
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: isCurrentYear ? "long" : "short",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  }).format(d);
}
