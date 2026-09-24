"use client";

import { useState } from "react";

import {
  ChartWorkbench,
  type ChartSymbol,
} from "@/components/market/chart-workbench";
import { TechnicalAnalysis } from "@/components/market/tradingview";
import type { Quote } from "@/lib/market";

/**
 * Home-page chart block: workbench plus a synced technical-analysis panel.
 * Active symbol is lifted here so both widgets stay aligned.
 */
export function ChartTerminalGrid({
  symbols,
  quotes,
  height = 560,
}: {
  symbols: ChartSymbol[];
  quotes: Quote[];
  height?: number;
}) {
  const [activeSymbol, setActiveSymbol] = useState(
    symbols[0]?.tvSymbol ?? "OANDA:XAUUSD",
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
      <ChartWorkbench
        symbols={symbols}
        initialQuotes={quotes}
        height={height}
        defaultSymbol={activeSymbol}
        onActiveChange={setActiveSymbol}
      />

      <div className="border-line bg-panel shadow-none overflow-hidden rounded-2xl border">
        <div className="border-line border-b px-4 py-3">
          <p className="eyebrow">
            <span className="chev" />
            Technical consensus
          </p>
          <p className="text-faint mt-1 text-xs">
            Multi-timeframe oscillator and moving-average rating on the
            selected symbol.
          </p>
        </div>
        <TechnicalAnalysis
          key={activeSymbol}
          symbol={activeSymbol}
          height={480}
          className="p-1"
          containerClassName="rounded-none"
        />
      </div>
    </div>
  );
}
