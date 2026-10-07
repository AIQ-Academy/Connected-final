"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdvancedChart, MiniChart } from "@/components/market/tradingview";
import { Sparkline } from "@/components/ui/sparkline";
import { ButtonLink } from "@/components/ui/button";
import {
  assetClassLabels,
  type AssetClass,
  type Quote,
  type QuotesResponse,
} from "@/lib/market";
import { signupUrl } from "@/lib/site";
import { cn, formatNumber } from "@/lib/utils";

export type ChartSymbol = {
  label: string;
  tvSymbol: string;
  assetClass?: string;
};

const INTERVALS = [
  { value: "15", label: "15m" },
  { value: "60", label: "1H" },
  { value: "240", label: "4H" },
  { value: "D", label: "1D" },
  { value: "W", label: "1W" },
] as const;

const POLL_INTERVAL_MS = 6000;

export type ChartWorkbenchCopy = {
  selectSymbol: string; selectTimeframe: string; closeDetail: string; chart: string;
  dayHigh: string; dayLow: string; spread: string; createAccount: string; indicative: string;
  assetClasses: Record<AssetClass, string>;
};
const defaultCopy: ChartWorkbenchCopy = {
  selectSymbol: "Select chart symbol", selectTimeframe: "Select chart timeframe", closeDetail: "Close symbol detail", chart: "Chart",
  dayHigh: "Day high", dayLow: "Day low", spread: "Spread", createAccount: "Create account", indicative: "Indicative pricing for analysis. Execution happens on your funded account.",
  assetClasses: assetClassLabels,
};

function fmt(value: number, decimals: number) {
  return formatNumber(value, decimals);
}

/**
 * Symbol and timeframe switcher wrapped around the TradingView advanced
 * chart. Selecting a symbol opens an inline detail panel and updates the
 * main chart — navigation only happens via the detail panel CTA.
 */
export function ChartWorkbench({
  symbols,
  height = 560,
  defaultSymbol,
  initialQuotes,
  onActiveChange,
  className,
  copy = defaultCopy,
}: {
  symbols: ChartSymbol[];
  height?: number;
  defaultSymbol?: string;
  initialQuotes?: Quote[];
  onActiveChange?: (tvSymbol: string) => void;
  className?: string;
  copy?: ChartWorkbenchCopy;
}) {
  const [active, setActive] = useState(
    defaultSymbol ?? symbols[0]?.tvSymbol ?? "OANDA:XAUUSD",
  );
  const [interval, setInterval] = useState<string>("60");
  const [detailLabel, setDetailLabel] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes ?? []);
  const reduced = useReducedMotion();

  const quoteByLabel = useMemo(
    () => new Map(quotes.map((quote) => [quote.symbol, quote])),
    [quotes],
  );

  const activeMeta = symbols.find((symbol) => symbol.tvSymbol === active);
  const detailQuote = detailLabel ? quoteByLabel.get(detailLabel) : undefined;

  const refreshQuotes = useCallback(async () => {
    const labels = symbols.map((symbol) => symbol.label).join(",");
    if (!labels) return;

    try {
      const response = await fetch(
        `/api/market/quotes?symbols=${encodeURIComponent(labels)}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const payload = (await response.json()) as QuotesResponse;
      setQuotes(payload.quotes);
    } catch {
      // Next poll recovers.
    }
  }, [symbols]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void refreshQuotes();
    }, 0);
    const timer = window.setInterval(() => {
      void refreshQuotes();
    }, POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [refreshQuotes]);

  function selectSymbol(symbol: ChartSymbol) {
    setActive(symbol.tvSymbol);
    onActiveChange?.(symbol.tvSymbol);
    setDetailLabel((current) =>
      current === symbol.label ? null : symbol.label,
    );
  }

  return (
    <div
      className={cn(
        "border-line bg-panel shadow-none overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="border-line space-y-2.5 border-b px-3 py-2.5 sm:px-4">
        <div
          role="group"
          aria-label={copy.selectSymbol}
          className="mask-fade-x flex max-w-full gap-1 overflow-x-auto pb-0.5"
        >
          {symbols.map((symbol) => (
            <button
              key={symbol.tvSymbol}
              type="button"
              onClick={() => selectSymbol(symbol)}
              aria-pressed={active === symbol.tvSymbol}
              aria-expanded={detailLabel === symbol.label}
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1 font-mono text-[0.75rem] font-medium whitespace-nowrap transition-colors",
                active === symbol.tvSymbol
                  ? "border-brand bg-brand/12 text-brand-light"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {symbol.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-faint truncate font-mono text-[0.625rem] tracking-wide uppercase">
            {activeMeta?.label ?? copy.chart}
          </p>
          <div
            role="group"
            aria-label={copy.selectTimeframe}
            className="border-line bg-sunken/60 flex shrink-0 gap-0.5 rounded-md border p-0.5"
          >
            {INTERVALS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setInterval(item.value)}
                aria-pressed={interval === item.value}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[0.6875rem] font-medium transition-colors",
                  interval === item.value
                    ? "bg-panel text-ink border border-line"
                    : "text-faint hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {detailLabel && detailQuote && (
          <motion.div
            key={detailLabel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.01 : 0.26,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="border-line bg-sunken/35 overflow-hidden border-b"
          >
            <SymbolDetailPanel
              quote={detailQuote}
              onClose={() => setDetailLabel(null)}
              copy={copy}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AdvancedChart
        key={`${active}-${interval}`}
        symbol={active}
        interval={interval}
        height={height}
        containerClassName="rounded-none"
      />
    </div>
  );
}

function SymbolDetailPanel({
  quote,
  onClose,
  copy,
}: {
  quote: Quote;
  onClose: () => void;
  copy: ChartWorkbenchCopy;
}) {
  const up = quote.changePct >= 0;
  const range = quote.dayHigh - quote.dayLow || 1;
  const position = ((quote.price - quote.dayLow) / range) * 100;

  return (
    <div className="grid gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] lg:items-center">
      <div>
        <p className="eyebrow mb-2">{copy.assetClasses[quote.assetClass]}</p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ink font-display text-xl font-semibold sm:text-2xl">
              {quote.displayName}
            </p>
            <p className="text-faint mt-0.5 font-mono text-xs">{quote.symbol}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeDetail}
            className="text-muted hover:text-ink border-line grid size-8 place-items-center rounded-md border transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
          <span className="text-ink tabular font-mono text-xl font-semibold">
            {fmt(quote.price, quote.decimals)}
          </span>
          <span
            className={cn(
              "tabular inline-flex items-center gap-1 font-mono text-sm font-medium",
              up ? "text-mint" : "text-loss",
            )}
          >
            {up ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            )}
            {up ? "+" : ""}
            {quote.changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="border-line bg-panel overflow-hidden rounded-lg border p-2">
          <MiniChart symbol={quote.tvSymbol} height={100} containerClassName="rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <DetailStat label={copy.dayHigh} value={fmt(quote.dayHigh, quote.decimals)} />
          <DetailStat label={copy.dayLow} value={fmt(quote.dayLow, quote.decimals)} />
          <DetailStat label={copy.spread} value={fmt(quote.spread, quote.decimals)} />
        </div>
        <Sparkline
          data={quote.history}
          positive={up}
          width={320}
          height={40}
          strokeWidth={2}
          className="w-full"
          gradientId={`chart-detail-${quote.symbol.replace(/\W/g, "")}`}
        />
        <div className="bg-line relative h-1.5 w-full rounded-full">
          <span
            className="bg-brand absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--cf-bg-panel)]"
            style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 lg:items-end">
        <ButtonLink href={signupUrl} size="sm">
          {copy.createAccount}
        </ButtonLink>
        <p className="text-faint max-w-[14rem] text-xs leading-relaxed">
          {copy.indicative}
        </p>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line bg-panel rounded-md border px-2.5 py-2">
      <p className="text-faint font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {label}
      </p>
      <p className="text-ink tabular mt-0.5 font-mono text-[0.8125rem]">{value}</p>
    </div>
  );
}
