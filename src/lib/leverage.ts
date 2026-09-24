import type { AssetClass } from "@/lib/market";

/**
 * Standard account leverage by asset class (brief, 12 Sep 2026).
 * Publish gate: confirm that each ratio is approved for the product,
 * customer category, jurisdiction, and account configuration before going live.
 */
export const standardLeverageByAssetClass: Record<AssetClass, string> = {
  forex: "1:100",
  indices: "1:200",
  metals: "1:200",
  commodities: "1:200",
  stocks: "1:200",
  crypto: "1:200",
};

export const standardLeverageSummary = [
  { label: "Forex", leverage: "1:100" },
  { label: "Indices", leverage: "1:200" },
  { label: "Metals", leverage: "1:200" },
  { label: "Energies", leverage: "1:200" },
  { label: "Stocks", leverage: "1:200" },
  { label: "Crypto", leverage: "1:200" },
] as const;

/** Prefer the brief Standard matrix over any stale instrument row. */
export function leverageForInstrument(
  assetClass: AssetClass,
  fallback?: string | null,
) {
  return standardLeverageByAssetClass[assetClass] ?? fallback ?? "—";
}
