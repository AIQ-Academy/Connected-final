import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  { decimals = 0, currency = "USD" }: { decimals?: number; currency?: string } = {},
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Price precision differs wildly across asset classes (JPY crosses need 3dp,
 * majors 5dp, indices 0). Derive it from magnitude so one formatter serves
 * every instrument in the ticker.
 */
export function priceDecimals(price: number) {
  if (price >= 10_000) return 0;
  if (price >= 1_000) return 1;
  if (price >= 100) return 2;
  if (price >= 10) return 3;
  return 5;
}
