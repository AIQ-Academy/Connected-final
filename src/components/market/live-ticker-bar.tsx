"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Pause, Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MiniChart } from "@/components/market/tradingview";
import { Sparkline } from "@/components/ui/sparkline";
import { ButtonLink } from "@/components/ui/button";
import {
  assetClassLabels,
  type Quote,
  type QuotesResponse,
} from "@/lib/market";
import { signupUrl } from "@/lib/site";
import { cn, formatNumber } from "@/lib/utils";

const POLL_INTERVAL_MS = 6000;
const STICKY_HEADER_HEIGHT = 76;
const TAPE_SYMBOLS = [
  "XAU/USD",
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "WTI",
  "NAS100",
  "BTC/USD",
  "ETH/USD",
  "XAG/USD",
  "SPX500",
];

function fmt(value: number, decimals: number) {
  return formatNumber(value, decimals);
}

export function LiveTickerBar({
  initialQuotes,
  className,
}: {
  initialQuotes: Quote[];
  className?: string;
}) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [pinned, setPinned] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const anchorY = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const previous = useRef(
    new Map(initialQuotes.map((q) => [q.symbol, q.price])),
  );

  const refresh = useCallback(async () => {
    try {
      const symbols = TAPE_SYMBOLS.join(",");
      const response = await fetch(
        `/api/market/quotes?symbols=${encodeURIComponent(symbols)}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const payload = (await response.json()) as QuotesResponse;
      for (const quote of payload.quotes) {
        previous.current.set(quote.symbol, quote.price);
      }
      setQuotes(payload.quotes);
      setSelected((current) =>
        current
          ? (payload.quotes.find((q) => q.symbol === current.symbol) ?? current)
          : null,
      );
    } catch {
      // Next poll recovers.
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, refresh]);

  // Keep the market tape available below the sticky site header after its
  // original position scrolls out of view. The spacer preserves page layout.
  useEffect(() => {
    const updatePosition = () => {
      const node = tickerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (!pinned) anchorY.current = rect.top + window.scrollY;
      const shouldPin =
        anchorY.current !== null &&
        window.scrollY + STICKY_HEADER_HEIGHT >= anchorY.current;
      if (shouldPin !== pinned) setPinned(shouldPin);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [pinned]);

  const tape = useMemo(() => {
    const order = new Map(TAPE_SYMBOLS.map((symbol, index) => [symbol, index]));
    return [...quotes].sort(
      (a, b) => (order.get(a.symbol) ?? 99) - (order.get(b.symbol) ?? 99),
    );
  }, [quotes]);

  function toggleSymbol(quote: Quote) {
    setSelected((current) => (current?.symbol === quote.symbol ? null : quote));
  }

  return (
    <>
      {pinned && <div aria-hidden="true" className="h-[46px]" />}
      <div
        ref={tickerRef}
        className={cn(
          "relative z-40",
          pinned && "fixed inset-x-0 top-[76px]",
          className,
        )}
      >
      <div className="border-line bg-raised/80 shadow-none flex items-stretch border-y">
        <div className="mask-fade-x marquee relative min-w-0 flex-1 overflow-hidden py-2">
          <div
            className="marquee-track flex w-max items-center gap-2"
            data-paused={paused ? "true" : "false"}
            style={{ ["--marquee-duration" as string]: "72s" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center gap-2 pe-2"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {tape.map((quote) => (
                  <TickerChip
                    key={`${copy}-${quote.symbol}`}
                    quote={quote}
                    active={selected?.symbol === quote.symbol}
                    onClick={() => toggleSymbol(quote)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Resume ticker" : "Pause ticker"}
          className="border-line-soft text-muted hover:text-ink hover:border-brand-light/50 grid w-11 shrink-0 place-items-center border-s transition-colors"
        >
          {paused ? (
            <Play className="size-3.5" />
          ) : (
            <Pause className="size-3.5" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key={selected.symbol}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.01 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="border-line bg-panel absolute inset-x-0 top-full z-50 overflow-hidden rounded-b-2xl border-b shadow-[0_20px_48px_-18px_rgb(0_0_0/0.5)]"
          >
            <TickerDetail quote={selected} onClose={() => setSelected(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

function TickerChip({
  quote,
  active,
  onClick,
}: {
  quote: Quote;
  active: boolean;
  onClick: () => void;
}) {
  const up = quote.changePct >= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-expanded={active}
      className={cn(
        "border-line-soft hover:border-brand-light/45 flex items-center gap-2 rounded-full border px-3 py-1.5 text-start transition-colors",
        active && "border-brand/50 bg-brand/10",
      )}
    >
      <span className="text-ink font-mono text-[0.75rem] font-medium">
        {quote.symbol}
      </span>
      <span className="text-muted tabular font-mono text-[0.75rem]">
        {fmt(quote.price, quote.decimals)}
      </span>
      <span
        className={cn(
          "tabular inline-flex items-center gap-0.5 font-mono text-[0.6875rem] font-medium",
          up ? "text-mint" : "text-loss",
        )}
      >
        {up ? (
          <ArrowUpRight className="size-3" aria-hidden="true" />
        ) : (
          <ArrowDownRight className="size-3" aria-hidden="true" />
        )}
        {up ? "+" : ""}
        {quote.changePct.toFixed(2)}%
      </span>
    </button>
  );
}

function TickerDetail({
  quote,
  onClose,
}: {
  quote: Quote;
  onClose: () => void;
}) {
  const up = quote.changePct >= 0;
  const range = quote.dayHigh - quote.dayLow || 1;
  const position = ((quote.price - quote.dayLow) / range) * 100;

  return (
    <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] lg:items-center">
      <div>
        <p className="eyebrow mb-2">{assetClassLabels[quote.assetClass]}</p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ink font-display text-2xl font-semibold">
              {quote.displayName}
            </p>
            <p className="text-faint mt-1 font-mono text-xs">{quote.symbol}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote detail"
            className="text-muted hover:text-ink border-line grid size-8 place-items-center rounded-lg border transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span
            className={cn(
              "tabular font-mono text-2xl font-semibold",
              up ? "text-mint" : "text-loss",
            )}
          >
            {fmt(quote.price, quote.decimals)}
          </span>
          <span
            className={cn(
              "tabular inline-flex items-center gap-1 font-mono text-sm font-medium",
              up ? "text-mint" : "text-loss",
            )}
          >
            {up ? "+" : ""}
            {quote.changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-line-soft bg-sunken/50 overflow-hidden rounded-xl border p-3">
          <p className="text-faint mb-2 px-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
            Chart preview · 1 day
          </p>
          <MiniChart
            symbol={quote.tvSymbol}
            height={160}
            className="rounded-lg"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <Stat label="Day high" value={fmt(quote.dayHigh, quote.decimals)} />
          <Stat label="Day low" value={fmt(quote.dayLow, quote.decimals)} />
          <Stat label="Spread" value={fmt(quote.spread, quote.decimals)} />
        </div>
        <div>
          <Sparkline
            data={quote.history}
            positive={up}
            width={320}
            height={48}
            strokeWidth={2}
            className="w-full"
            gradientId={`tape-${quote.symbol.replace(/\W/g, "")}`}
          />
          <div className="bg-line-soft relative mt-3 h-1.5 w-full rounded-full">
            <span
              className="bg-brand absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--cf-bg-panel)]"
              style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 lg:items-end">
        <ButtonLink
          href={signupUrl}
          size="sm"
          className="w-full"
        >
          Trade ${quote.symbol} Now
        </ButtonLink>

        <ButtonLink
          size="sm"
          className="w-full"
          variant="mint"
          href={`https://www.tradingview.com/symbols/${quote.tvSymbol}/`}
        >
          View in trading view
        </ButtonLink>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line-soft bg-raised rounded-lg border px-3 py-2">
      <p className="text-faint font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {label}
      </p>
      <p className="text-ink tabular mt-1 font-mono text-[0.8125rem]">
        {value}
      </p>
    </div>
  );
}
