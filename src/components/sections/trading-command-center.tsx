"use client";

import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Radio,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useLocale } from "@/components/i18n/locale-provider";
import { Container, Section } from "@/components/ui/container";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { type Quote, type QuotesResponse } from "@/lib/market";
import { cn } from "@/lib/utils";

type MarketMeta = {
  symbol: string;
  name: string;
  nameKey: DictionaryKey;
  color: string;
  fallback: number;
};

type Market = MarketMeta & Quote;
type MarketFilter = "all" | "forex" | "metals" | "indices" | "crypto" | "watchlist";

const marketMeta: MarketMeta[] = [
  { symbol: "XAU/USD", name: "Gold", nameKey: "home.command.marketGold", color: "var(--cf-palette-5)", fallback: 2654.82 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", nameKey: "home.command.marketEuro", color: "var(--cf-palette-2)", fallback: 1.08462 },
  { symbol: "NAS100", name: "Nasdaq 100", nameKey: "home.command.marketNasdaq", color: "var(--cf-palette-4)", fallback: 18426.3 },
  { symbol: "BTC/USD", name: "Bitcoin", nameKey: "home.command.marketBitcoin", color: "var(--cf-palette-6)", fallback: 64182.5 },
  { symbol: "WTI", name: "Crude Oil", nameKey: "home.command.marketOil", color: "var(--cf-palette-3)", fallback: 77.16 },
];

const filters: { value: MarketFilter; label: DictionaryKey }[] = [
  { value: "all", label: "home.command.all" },
  { value: "forex", label: "home.command.forex" },
  { value: "metals", label: "home.command.metals" },
  { value: "indices", label: "home.command.indices" },
  { value: "crypto", label: "home.command.crypto" },
  { value: "watchlist", label: "home.command.watchlist" },
];

const symbols = marketMeta.map((market) => market.symbol).join(",");
const WATCHLIST_KEY = "connect-funded-market-watchlist";

function formatPrice(
  value: number,
  symbol: string,
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string,
) {
  const decimals = symbol === "EUR/USD" ? 5 : symbol === "WTI" || symbol === "BTC/USD" ? 2 : 2;
  return formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fallbackQuote(meta: MarketMeta): Market {
  const assetClass = meta.symbol === "XAU/USD"
    ? "metals"
    : meta.symbol === "EUR/USD"
      ? "forex"
      : meta.symbol === "NAS100"
        ? "indices"
        : meta.symbol === "BTC/USD"
          ? "crypto"
          : "commodities";

  return {
    ...meta,
    symbol: meta.symbol,
    displayName: meta.name,
    tvSymbol: "",
    assetClass,
    price: meta.fallback,
    bid: meta.fallback,
    ask: meta.fallback,
    spread: 0,
    change: 0,
    changePct: 0,
    dayHigh: meta.fallback,
    dayLow: meta.fallback,
    decimals: meta.symbol === "EUR/USD" ? 5 : 2,
    history: Array.from({ length: 12 }, (_, index) => 40 + index * 3),
    source: "simulated",
  };
}

export function TradingCommandCenter() {
  const { t, formatNumber, direction } = useLocale();
  const [activeFilter, setActiveFilter] = useState<MarketFilter>("all");
  const [markets, setMarkets] = useState<Market[]>(() => marketMeta.map(fallbackQuote));
  const [selectedSymbol, setSelectedSymbol] = useState(marketMeta[0].symbol);
  const [feed, setFeed] = useState<"mt5" | "market-data" | "simulated">("simulated");
  const [watchlist, setWatchlist] = useState<string[]>(["XAU/USD", "EUR/USD"]);
  const [watchlistReady, setWatchlistReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(WATCHLIST_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlist(parsed.filter((item): item is string =>
              typeof item === "string" && marketMeta.some((market) => market.symbol === item),
            ));
          }
        }
      } catch {
        // A blocked or malformed local preference falls back to the starter list.
      } finally {
        setWatchlistReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!watchlistReady) return;
    try {
      window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {
      // Trading remains usable when the browser blocks local storage.
    }
  }, [watchlist, watchlistReady]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/market/quotes?symbols=${encodeURIComponent(symbols)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as QuotesResponse & {
          provider?: "mt5" | "market-data" | "simulated";
        };
        if (!mounted) return;
        const next = payload.quotes.flatMap((quote) => {
          const meta = marketMeta.find((item) => item.symbol === quote.symbol);
          return meta ? [{ ...quote, ...meta }] : [];
        });
        if (next.length) setMarkets(next);
        setFeed(payload.provider ?? (payload.source === "live" ? "market-data" : "simulated"));
      } catch {
        // Keep the last successful quote set while the next poll recovers.
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 6000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const visibleMarkets = useMemo(() => {
    const filterSymbols: Partial<Record<MarketFilter, string[]>> = {
      forex: ["EUR/USD"],
      metals: ["XAU/USD"],
      indices: ["NAS100"],
      crypto: ["BTC/USD"],
      watchlist,
    };
    const include = filterSymbols[activeFilter];
    return include ? markets.filter((market) => include.includes(market.symbol)) : markets;
  }, [activeFilter, markets, watchlist]);

  const selected = markets.find((market) => market.symbol === selectedSymbol) ?? markets[0]!;
  const feedKey: DictionaryKey = feed === "mt5"
    ? "home.command.feedMt5"
    : feed === "market-data"
      ? "home.command.feedLive"
      : "home.command.feedIndicative";
  const range = Math.max(...selected.history) - Math.min(...selected.history) || 1;
  const historicalLow = Math.min(...selected.history);

  function toggleWatchlist(symbol: string) {
    setWatchlist((items) =>
      items.includes(symbol) ? items.filter((item) => item !== symbol) : [...items, symbol],
    );
  }

  return (
    <Section
      id="command-center"
      size="spacious"
      className="border-y border-line-soft bg-[var(--cf-section-white)] text-ink"
    >
      <Container className="relative">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--cf-terminal-bg)] px-4 py-7 text-white shadow-[0_28px_70px_-42px_rgb(var(--cf-brand-glow)/.7)] sm:px-7 sm:py-9 lg:px-9 lg:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgb(var(--cf-brand-glow)/.42),transparent_44%),radial-gradient(ellipse_at_100%_100%,rgb(var(--cf-accent-glow)/.14),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgb(255_255_255/.045)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.045)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div className="relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-3 py-1.5 text-xs font-medium tracking-[.12em] text-[var(--cf-terminal-accent)] uppercase">
              <Radio className="size-3.5" /> {t("home.command.eyebrow")}
            </div>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,1.2rem+3vw,3.65rem)] leading-[1.03] font-semibold tracking-[-.04em] text-white">
              {t("home.command.title")}
            </h2>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/68">
              {t("home.command.lead")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/markets"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgb(var(--cf-brand-glow)/.9)] transition-all hover:-translate-y-0.5 hover:bg-[var(--cf-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {t("home.command.open")} <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/tools/calculator"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[.035] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {t("home.command.calculator")} <ChevronRight className={cn("size-4", direction === "rtl" && "rotate-180")} />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,.8fr)]">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-[var(--cf-terminal-glass-90)] shadow-[0_28px_90px_-48px_rgb(0_0_0/.8)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 text-[.68rem] font-medium tracking-[.12em] text-white/65 uppercase">
                <span className={cn("size-2 rounded-full", feed === "mt5" ? "animate-pulse bg-mint" : "bg-amber")} />
                {t(feedKey)}
              </div>
              <div role="group" aria-label={t("home.command.tabsLabel")} className="flex max-w-full flex-wrap gap-1 rounded-full border border-white/[.07] bg-[var(--cf-terminal-glass-75)] p-1">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    aria-pressed={activeFilter === filter.value}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[.68rem] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cf-terminal-accent)]",
                      activeFilter === filter.value
                        ? "bg-[var(--cf-terminal-selected)] text-[var(--cf-terminal-selected-text)] shadow-sm"
                        : "text-white/55 hover:bg-white/[.07] hover:text-white",
                    )}
                  >
                    {t(filter.label)}{filter.value === "watchlist" ? ` · ${watchlist.length}` : ""}
                  </button>
                ))}
              </div>
            </div>

            {visibleMarkets.length > 0 ? (
              <div className="divide-y divide-white/[.07]">
                {visibleMarkets.map((market) => {
                  const active = selected.symbol === market.symbol;
                  const saved = watchlist.includes(market.symbol);
                  const name = t(market.nameKey);
                  const changeUp = market.changePct >= 0;
                  return (
                    <div key={market.symbol} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedSymbol(market.symbol)}
                        aria-pressed={active}
                        className={cn(
                          "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-s-2 px-4 py-4 pe-14 text-start transition-all sm:grid-cols-[minmax(0,1fr)_minmax(5.5rem,.52fr)_auto] sm:gap-4 sm:px-6",
                          active ? "bg-white/[.075]" : "border-s-transparent hover:bg-white/[.045]",
                        )}
                        style={{ borderInlineStartColor: active ? market.color : undefined }}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-xl border text-[.66rem] font-bold transition-transform group-hover:scale-105"
                            style={{ color: market.color, borderColor: `color-mix(in srgb, ${market.color} 35%, transparent)`, backgroundColor: `color-mix(in srgb, ${market.color} 13%, transparent)` }}
                          >
                            {market.symbol.split("/")[0].slice(0, 2)}
                          </span>
                          <span className="min-w-0">
                            <strong className="block truncate text-sm font-semibold text-white">{market.symbol}</strong>
                            <small className="block truncate text-[.68rem] text-white/45">{name}</small>
                          </span>
                        </span>
                        <span className="hidden h-8 items-end justify-center gap-1 opacity-65 transition-opacity group-hover:opacity-100 sm:flex" aria-hidden>
                          {market.history.slice(-12).map((value, index) => (
                            <i
                              key={index}
                              className="w-1.5 rounded-full bg-current transition-all duration-300 group-hover:opacity-100"
                              style={{ color: market.color, height: `${Math.max(8, 8 + ((value - Math.min(...market.history)) / (Math.max(...market.history) - Math.min(...market.history) || 1)) * 22)}px`, opacity: 0.45 + index / 24 }}
                            />
                          ))}
                        </span>
                        <span className="text-end">
                          <strong className="block font-mono text-sm font-medium tabular-nums text-white">{formatPrice(market.price, market.symbol, formatNumber)}</strong>
                          <small className={cn("font-mono text-[.68rem] tabular-nums", changeUp ? "text-mint" : "text-loss")}>{changeUp ? "+" : ""}{formatNumber(market.changePct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={t(saved ? "home.command.removeWatchlist" : "home.command.addWatchlist").replace("{symbol}", market.symbol)}
                        aria-pressed={saved}
                        onClick={() => toggleWatchlist(market.symbol)}
                        className="absolute end-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-white/40 transition-all hover:bg-white/10 hover:text-[var(--cf-terminal-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cf-terminal-accent)] aria-pressed:text-[var(--cf-terminal-accent)] sm:end-4"
                      >
                        <Star className={cn("size-4 transition-transform", saved && "scale-110 fill-current")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
                <div className="max-w-sm">
                  <Star className="mx-auto size-6 text-[var(--cf-terminal-accent)]" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{t("home.command.watchlistEmpty")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t("home.command.watchlistHint")}</p>
                  <button type="button" onClick={() => setActiveFilter("all")} className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/35 hover:bg-white/[.06] focus-visible:outline-2 focus-visible:outline-[var(--cf-terminal-accent)]">
                    {t("home.command.showAll")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <article className="relative overflow-hidden rounded-[1.5rem] border border-white/14 bg-[linear-gradient(145deg,var(--cf-terminal-surface)_0%,var(--cf-terminal-raised)_55%,var(--cf-terminal-sunken)_100%)] p-5 shadow-[0_28px_90px_-48px_rgb(0_0_0/.8)] sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[.14em] text-[var(--cf-terminal-accent)] uppercase">{t("home.command.selected")}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">{selected.symbol}</h3>
                <p className="mt-1 text-sm text-white/50">{t(selected.nameKey)} · {t(feed === "mt5" ? "home.command.liveQuote" : "home.command.indicativeQuote")}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-[.65rem] font-medium text-white/65">
                <span className={cn("size-1.5 rounded-full", feed === "mt5" ? "animate-pulse bg-mint" : "bg-amber")} />
                {t(feedKey)}
              </span>
            </div>

            <div className="relative mt-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[clamp(1.8rem,1.4rem+1.5vw,2.5rem)] font-semibold leading-none tracking-[-.04em] text-white tabular-nums">{formatPrice(selected.price, selected.symbol, formatNumber)}</p>
                <p className={cn("mt-2 font-mono text-sm", selected.changePct >= 0 ? "text-mint" : "text-loss")}>{selected.changePct >= 0 ? "+" : ""}{formatNumber(selected.changePct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% {t("home.command.today")}</p>
              </div>
              <span className="rounded-full border border-[var(--cf-terminal-accent-border)] bg-[var(--cf-terminal-accent-wash)] px-3 py-1.5 font-mono text-xs text-[var(--cf-terminal-accent)]">{formatNumber(selected.spread, { maximumFractionDigits: selected.decimals })} {t("home.command.spread")}</span>
            </div>

            <div role="img" aria-label={`${selected.symbol} indicative price history`} className="relative mt-6 flex h-28 items-end gap-1.5 overflow-hidden rounded-xl border border-white/[.06] bg-[var(--cf-terminal-glass-55)] px-3 pt-4 pb-2">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_32%,rgb(255_255_255/.06)_33%,transparent_34%,transparent_65%,rgb(255_255_255/.06)_66%,transparent_67%)]" />
              {selected.history.slice(-12).map((value, index) => {
                const height = Math.max(10, 12 + ((value - historicalLow) / range) * 72);
                return <span key={index} className="relative flex-1 rounded-t-sm transition-[height,opacity] duration-500" style={{ height: `${height}%`, background: `linear-gradient(to top, ${selected.color}, rgb(255 255 255 / .7))`, opacity: 0.4 + index / 20 }} />;
              })}
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-2">
              <Signal icon={<Zap />} label={t("home.command.feed")} value={feed === "mt5" ? "MT5" : t("home.command.feedIndicative")} />
              <Signal icon={<ShieldCheck />} label={t("home.command.leverage")} value={selected.assetClass === "forex" ? "1:100" : "1:200"} />
              <Signal icon={<BarChart3 />} label={t("home.command.charting")} value="TradingView" />
            </div>
          </article>
        </div>
        <p className="mt-4 max-w-4xl text-xs leading-relaxed text-white/45">{t("home.command.note")}</p>
      </div>
        </div>
      </Container>
    </Section>
  );
}

function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--cf-terminal-glass-55)] px-3 py-3 transition-colors hover:border-white/20 hover:bg-[var(--cf-terminal-glass-90)]">
      <span className="flex items-center gap-1.5 text-[.62rem] tracking-[.1em] text-white/45 uppercase">{icon}<span>{label}</span></span>
      <strong className="mt-2 block truncate text-[.72rem] font-medium text-white/85">{value}</strong>
    </div>
  );
}
