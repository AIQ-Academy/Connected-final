"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Sparkline } from "@/components/ui/sparkline";
import { ButtonLink } from "@/components/ui/button";
import { LiveDot } from "@/components/ui/badge";
import {
  ASSET_CLASSES,
  type AssetClass,
  type Quote,
  type QuotesResponse,
} from "@/lib/market";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

type SortKey = "symbol" | "price" | "changePct" | "spread";
type SortDirection = "asc" | "desc";
type FlashDirection = "up" | "down";

const POLL_INTERVAL_MS = 6000;
const assetClassTranslationKeys: Record<AssetClass, "asset.forex" | "asset.metals" | "asset.commodities" | "asset.indices" | "asset.crypto" | "asset.stocks"> = {
  forex: "asset.forex",
  metals: "asset.metals",
  commodities: "asset.commodities",
  indices: "asset.indices",
  crypto: "asset.crypto",
  stocks: "asset.stocks",
};

function fmt(value: number, decimals: number, locale: "en" | "fr" | "ar") {
  const localeTag = locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-US";
  return new Intl.NumberFormat(localeTag, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function QuoteGrid({
  initialQuotes,
  defaultAssetClass = "all",
  compact = false,
  className,
}: {
  initialQuotes: Quote[];
  defaultAssetClass?: AssetClass | "all";
  compact?: boolean;
  className?: string;
}) {
  const { t, locale } = useLocale();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [filter, setFilter] = useState<AssetClass | "all">(defaultAssetClass);
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<
    Record<string, { direction: FlashDirection; nonce: number }>
  >({});

  const reduced = useReducedMotion();
  const previousPrices = useRef(
    new Map(initialQuotes.map((q) => [q.symbol, q.price])),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/market/quotes", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as QuotesResponse;

      const nextFlashes: Record<
        string,
        { direction: FlashDirection; nonce: number }
      > = {};
      const nonce = Date.now();
      for (const quote of payload.quotes) {
        const previous = previousPrices.current.get(quote.symbol);
        if (previous !== undefined && previous !== quote.price) {
          nextFlashes[quote.symbol] = {
            direction: quote.price > previous ? "up" : "down",
            nonce,
          };
        }
        previousPrices.current.set(quote.symbol, quote.price);
      }

      setQuotes(payload.quotes);
      setAsOf(payload.asOf);
      if (Object.keys(nextFlashes).length) {
        setFlashes((current) => ({ ...current, ...nextFlashes }));
      }
    } catch {
      // A dropped poll is not worth surfacing; the next tick recovers.
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (paused) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(refresh, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    // Polling a background tab burns quota for nothing.
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        void refresh();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, refresh]);

  const availableClasses = useMemo(() => {
    const present = new Set(quotes.map((q) => q.assetClass));
    return ASSET_CLASSES.filter((c) => present.has(c));
  }, [quotes]);

  const rows = useMemo(() => {
    const filtered =
      filter === "all"
        ? quotes
        : quotes.filter((quote) => quote.assetClass === filter);

    const factor = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol) * factor;
      return (a[sortKey] - b[sortKey]) * factor;
    });
  }, [quotes, filter, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "symbol" ? "asc" : "desc");
    }
  }

  const counts = useMemo(() => {
    const map = new Map<AssetClass, number>();
    for (const quote of quotes) {
      map.set(quote.assetClass, (map.get(quote.assetClass) ?? 0) + 1);
    }
    return map;
  }, [quotes]);

  return (
    <div
      className={cn(
        "border-line bg-panel shadow-none overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div
          role="group"
          aria-label={t("ui.quoteFilter")}
          className="flex flex-wrap items-center gap-1.5"
        >
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={quotes.length}
          >
            {t("market.allMarkets")}
          </FilterChip>
          {availableClasses.map((assetClass) => (
            <FilterChip
              key={assetClass}
              active={filter === assetClass}
              onClick={() => setFilter(assetClass)}
              count={counts.get(assetClass) ?? 0}
            >
              {t(assetClassTranslationKeys[assetClass])}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-faint hidden items-center gap-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase sm:flex">
            <LiveDot tone={paused ? "amber" : "mint"} />
            {paused ? t("ui.quotePaused") : t("ui.quoteStreaming")}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label={t("ui.quoteRefresh")}
            className="border-line text-muted hover:text-ink hover:border-brand-light/60 grid size-8 place-items-center rounded-lg border transition-colors"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            aria-label={paused ? t("ui.quoteResume") : t("ui.quotePause")}
            className="border-line text-muted hover:text-ink hover:border-brand-light/60 grid size-8 place-items-center rounded-lg border transition-colors"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            {t("ui.quoteCaption")}
          </caption>
          <thead>
            <tr>
              <SortableTh
                label={t("ui.quoteInstrument")}
                sortKey="symbol"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={toggleSort}
                className="ps-4 text-start sm:ps-5"
              />
              <SortableTh
                label="Bid"
                sortKey="price"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={toggleSort}
                align="right"
              />
              <th
                scope="col"
                className="border-line-soft text-faint bg-sunken/60 border-b px-3 py-3 text-end font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase"
              >
                {t("market.ask")}
              </th>
              <SortableTh
                label="Spread"
                sortKey="spread"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={toggleSort}
                align="right"
                className="hidden sm:table-cell"
              />
              <SortableTh
                label="Change"
                sortKey="changePct"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={toggleSort}
                align="right"
              />
              <th
                scope="col"
                className="border-line-soft text-faint bg-sunken/60 hidden border-b px-3 py-3 text-end font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase lg:table-cell"
              >
                {t("ui.quoteTrend")}
              </th>
              <th
                scope="col"
                className="border-line-soft bg-sunken/60 w-10 border-b px-3 py-3"
              >
                <span className="sr-only">{t("ui.quoteExpand")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((quote) => {
              const flash = flashes[quote.symbol];
              const up = quote.changePct >= 0;
              const isOpen = expanded === quote.symbol;

              return (
                <Fragment key={quote.symbol}>
                  <tr
                    onClick={() =>
                      setExpanded(isOpen ? null : quote.symbol)
                    }
                    className={cn(
                      "hover:bg-sunken/60 cursor-pointer transition-colors",
                      isOpen && "bg-sunken/70",
                    )}
                  >
                    <td className="border-line-soft border-b py-3 ps-4 sm:ps-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            up ? "bg-mint" : "bg-loss",
                          )}
                        />
                        <span>
                          <span className="text-ink block font-mono text-[0.8125rem] font-medium">
                            {quote.symbol}
                          </span>
                          {!compact && (
                            <span className="text-faint block text-xs">
                              {quote.displayName}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td
                      key={`${quote.symbol}-bid-${flash?.nonce ?? 0}`}
                      className={cn(
                        "border-line-soft tabular text-ink border-b px-3 py-3 text-end font-mono text-[0.8125rem]",
                        !reduced &&
                          flash &&
                          (flash.direction === "up" ? "flash-up" : "flash-down"),
                      )}
                    >
                      {fmt(quote.bid, quote.decimals, locale)}
                    </td>
                    <td className="border-line-soft tabular text-muted border-b px-3 py-3 text-end font-mono text-[0.8125rem]">
                      {fmt(quote.ask, quote.decimals, locale)}
                    </td>
                    <td className="border-line-soft tabular text-faint hidden border-b px-3 py-3 text-end font-mono text-xs sm:table-cell">
                      {fmt(quote.spread, quote.decimals, locale)}
                    </td>
                    <td className="border-line-soft border-b px-3 py-3 text-end">
                      <span
                        className={cn(
                          "tabular inline-flex items-center justify-end gap-1 font-mono text-[0.8125rem] font-medium",
                          up ? "text-mint" : "text-loss",
                        )}
                      >
                        {up ? (
                          <ArrowUpRight className="size-3.5" />
                        ) : (
                          <ArrowDownRight className="size-3.5" />
                        )}
                        {up ? "+" : ""}
                        {quote.changePct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="border-line-soft hidden border-b px-3 py-2 lg:table-cell">
                      <div className="flex justify-end">
                        <Sparkline
                          data={quote.history}
                          positive={up}
                          width={84}
                          height={28}
                          gradientId={`spark-${quote.symbol.replace(/\W/g, "")}`}
                        />
                      </div>
                    </td>
                    <td className="border-line-soft border-b px-3 py-3 text-end">
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "text-faint inline size-4 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                      <span className="sr-only">
                        {isOpen ? t("ui.quoteHide") : t("ui.quoteShow")} {quote.symbol} {t("ui.quoteDetail")}
                      </span>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <tr>
                        <td colSpan={7} className="border-line-soft border-b p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: reduced ? 0.01 : 0.28,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <QuoteDetail quote={quote} />
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-line-soft text-faint flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 font-mono text-[0.6875rem] tracking-wide sm:px-5">
        <span>
          {rows.length} instrument{rows.length === 1 ? "" : "s"} · indicative
          pricing, not an execution quote
        </span>
        <span suppressHydrationWarning>
          {asOf
            ? `Updated ${new Date(asOf).toLocaleTimeString("en-GB", { hour12: false })} local`
            : `Refreshing every ${POLL_INTERVAL_MS / 1000}s`}
        </span>
      </div>
    </div>
  );
}

function QuoteDetail({ quote }: { quote: Quote }) {
  const { t, locale } = useLocale();
  const range = quote.dayHigh - quote.dayLow || 1;
  const position = ((quote.price - quote.dayLow) / range) * 100;

  return (
    <div className="bg-sunken/40 grid gap-6 px-4 py-6 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto]">
      <div>
        <p className="eyebrow mb-3">{t(assetClassTranslationKeys[quote.assetClass])}</p>
        <p className="text-ink font-display text-2xl font-semibold">
          {quote.displayName}
        </p>
        <p className="text-faint mt-1 font-mono text-xs">
          {quote.symbol} · {quote.tvSymbol}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-xs sm:grid-cols-3">
          <Stat label={t("market.high")} value={fmt(quote.dayHigh, quote.decimals, locale)} />
          <Stat label={t("market.low")} value={fmt(quote.dayLow, quote.decimals, locale)} />
          <Stat label={t("market.spread")} value={fmt(quote.spread, quote.decimals, locale)} />
          <Stat
            label={t("market.change")}
            value={`${quote.change >= 0 ? "+" : ""}${fmt(quote.change, quote.decimals, locale)}`}
            tone={quote.change >= 0 ? "mint" : "loss"}
          />
          <Stat
            label={t("ui.quoteFeed")}
            value={quote.source === "live" ? t("ui.quoteProvider") : t("market.indicative")}
          />
        </dl>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <Sparkline
          data={quote.history}
          positive={quote.changePct >= 0}
          width={320}
          height={72}
          strokeWidth={2}
          className="w-full"
          gradientId={`detail-${quote.symbol.replace(/\W/g, "")}`}
        />
        <div>
          <div className="bg-line-soft relative h-1.5 w-full rounded-full">
            <span
              className="bg-brand absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[var(--cf-bg-panel)]"
              style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
            />
          </div>
          <div className="text-faint tabular mt-2 flex justify-between font-mono text-[0.6875rem]">
            <span>{fmt(quote.dayLow, quote.decimals, locale)}</span>
            <span>{t("ui.quoteDayRange")}</span>
            <span>{fmt(quote.dayHigh, quote.decimals, locale)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2.5 lg:items-end lg:justify-center">
        <ButtonLink href={signupUrl} size="sm">
          {t("ui.quoteTrade")} {quote.symbol}
        </ButtonLink>
        <Link
          href={`/markets#charts`}
          className="text-brand-light text-xs font-semibold hover:underline"
        >
          {t("ui.quoteOpenChart")}
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "mint" | "loss";
}) {
  return (
    <div>
      <dt className="text-faint font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "tabular mt-1 font-mono text-[0.8125rem]",
          tone === "mint" && "text-mint",
          tone === "loss" && "text-loss",
          !tone && "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
        active
          ? "border-brand bg-brand/15 text-brand-light"
          : "border-line text-muted hover:text-ink hover:border-line",
      )}
    >
      {children}
      <span className="tabular ms-1.5 font-mono text-[0.625rem] opacity-60">
        {count}
      </span>
    </button>
  );
}

function SortableTh({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "right",
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = activeKey === sortKey;

  return (
    <th
      scope="col"
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn(
        "border-line-soft bg-sunken/60 border-b px-3 py-3",
        align === "right" ? "text-end" : "text-start",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase transition-colors",
          active ? "text-brand-light" : "text-faint hover:text-ink",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3 transition-transform",
            active && direction === "asc" && "rotate-180",
            !active && "opacity-0",
          )}
        />
      </button>
    </th>
  );
}
