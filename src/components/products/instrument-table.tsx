import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import type { MarketInstrument } from "@/db/schema";
import { decimalsForPip, type AssetClass } from "@/lib/market";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Spreads are quoted in each class's own convention: pips for FX, index
 * points for cash indices, and the quote currency everywhere else.
 */
const spreadConvention: Record<
  AssetClass,
  { decimals: number; unit: string }
> = {
  forex: { decimals: 1, unit: "pips" },
  metals: { decimals: 3, unit: "USD" },
  commodities: { decimals: 3, unit: "USD" },
  indices: { decimals: 1, unit: "pts" },
  crypto: { decimals: 2, unit: "USD" },
  stocks: { decimals: 2, unit: "USD" },
};

/** Decimal places needed to print a tick exactly (0.0001 → 4, 1 → 0). */
function tickDecimals(pipSize: number) {
  return Math.max(0, Math.round(-Math.log10(pipSize)));
}

/**
 * Forex is quoted one digit finer than its pip — the fractional pip. Every
 * other class prints exactly to its tick.
 */
function quotedDecimals(assetClass: AssetClass, pipSize: number) {
  return assetClass === "forex"
    ? decimalsForPip(pipSize)
    : tickDecimals(pipSize);
}

/** "1:100" → 1% initial margin. */
function marginFromLeverage(leverage: string) {
  const factor = Number(leverage.split(":")[1]);
  if (!Number.isFinite(factor) || factor <= 0) return "—";
  const margin = 100 / factor;
  return `${formatNumber(margin, Number.isInteger(margin) ? 0 : 1)}%`;
}

export function InstrumentTable({
  assetClass,
  instruments,
  caption,
  locale = "en",
}: {
  assetClass: AssetClass;
  instruments: MarketInstrument[];
  caption: string;
  locale?: Locale;
}) {
  const convention = spreadConvention[assetClass];
  const labels = locale === "ar"
    ? ["الرمز", "الأداة", "السبريد ابتداءً من", "حجم التكة", "دقة السعر", "أقصى رافعة", "الهامش", "ساعات التداول"]
    : locale === "fr"
      ? ["Symbole", "Instrument", "Spread à partir de", "Taille du tick", "Précision du prix", "Levier maximal", "Marge", "Horaires"]
      : ["Symbol", "Instrument", "Spread from", "Tick size", "Price precision", "Max leverage", "Margin", "Hours"];

  return (
    <TableShell caption={caption}>
      <Table className="min-w-[880px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <Th className="ps-5">{labels[0]}</Th>
            <Th>{labels[1]}</Th>
            <Th className="text-end">{labels[2]}</Th>
            <Th className="text-end">{labels[3]}</Th>
            <Th className="text-end">{labels[4]}</Th>
            <Th className="text-end">{labels[5]}</Th>
            <Th className="text-end">{labels[6]}</Th>
            <Th className="pe-5 text-end">{labels[7]}</Th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((instrument) => (
            <Tr key={instrument.id}>
              <Td className="text-ink ps-5 font-mono text-[0.8125rem] font-medium">
                {instrument.symbol}
              </Td>
              <Td className="text-muted text-[0.8125rem]">
                {instrument.displayName}
              </Td>
              <Td className="tabular text-ink text-end font-mono text-[0.8125rem]">
                {formatNumber(instrument.baseSpread, convention.decimals)}
                <span className="text-faint ms-1.5 text-[0.6875rem]">
                  {convention.unit}
                </span>
              </Td>
              <Td className="tabular text-muted text-end font-mono text-[0.8125rem]">
                {formatNumber(
                  instrument.pipSize,
                  tickDecimals(instrument.pipSize),
                )}
              </Td>
              <Td className="tabular text-muted text-end font-mono text-[0.8125rem]">
                {quotedDecimals(assetClass, instrument.pipSize)} dp
              </Td>
              <Td className="tabular text-muted text-end font-mono text-[0.8125rem]">
                {instrument.maxLeverage}
              </Td>
              <Td className="tabular text-muted text-end font-mono text-[0.8125rem]">
                {marginFromLeverage(instrument.maxLeverage)}
              </Td>
              <Td className="tabular text-muted pe-5 text-end font-mono text-[0.8125rem]">
                {instrument.tradingHours}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}
