"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const EMBED_BASE = "https://s3.tradingview.com/external-embedding/embed-widget-";

type WidgetName =
  | "ticker-tape"
  | "advanced-chart"
  | "mini-symbol-overview"
  | "market-overview"
  | "technical-analysis"
  | "screener"
  | "events"
  | "symbol-info";

/**
 * Fires once the element has been within `rootMargin` of the viewport, then
 * stops observing. Keeps every TradingView script out of the critical path.
 */
function useLazyMount<T extends HTMLElement>(rootMargin = "320px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return { ref, visible };
}

function BrandedSkeleton({
  height,
  label,
}: {
  height: number | string;
  label: string;
}) {
  return (
    <div
      className="border-line bg-sunken/60 relative grid w-full place-items-center overflow-hidden rounded-lg border shadow-none"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgb(var(--cf-brand-glow)/0.09)_50%,transparent_65%)] bg-[length:200%_100%]" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="chev animate-pulse size-4" />
        <span className="text-faint font-mono text-[0.6875rem] tracking-[0.16em] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Core embed. TradingView widgets are loaded by appending a <script> whose
 * innerHTML is the JSON config. The container is fully rebuilt whenever the
 * config or theme changes, which also makes the effect safe to run twice
 * under React strict mode.
 */
function TradingViewWidget({
  widget,
  config,
  height,
  label,
  className,
  containerClassName,
}: {
  widget: WidgetName;
  config: Record<string, unknown>;
  height: number | string;
  label: string;
  className?: string;
  containerClassName?: string;
}) {
  const { resolvedTheme } = useTheme();
  const { ref, visible } = useLazyMount<HTMLDivElement>();
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Avoid a theme flash: wait for next-themes to resolve before first mount.
  const mounted = useHydrated();

  const colorTheme = resolvedTheme === "light" ? "light" : "dark";
  const configKey = JSON.stringify(config);

  useEffect(() => {
    if (!visible || !mounted) return;
    const host = hostRef.current;
    if (!host) return;

    setReady(false);
    host.replaceChildren();

    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    inner.style.height = "100%";
    inner.style.width = "100%";
    host.append(inner);

    const script = document.createElement("script");
    script.src = `${EMBED_BASE}${widget}.js`;
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      ...(JSON.parse(configKey) as Record<string, unknown>),
      colorTheme,
    });
    script.addEventListener("load", () => setReady(true));
    // The widget paints from inside an iframe; reveal it on a short delay in
    // case the load event has already fired by the time we attach.
    const timer = window.setTimeout(() => setReady(true), 1200);
    host.append(script);

    return () => {
      window.clearTimeout(timer);
      host.replaceChildren();
    };
  }, [visible, mounted, widget, configKey, colorTheme]);

  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {(!visible || !ready) && (
        <div className={cn(!ready && visible && "absolute inset-0 z-10")}>
          <BrandedSkeleton height={height} label={label} />
        </div>
      )}
      <div
        ref={hostRef}
        className={cn(
          "tradingview-widget-container overflow-hidden rounded-2xl",
          !visible && "hidden",
          containerClassName,
        )}
        style={{ height: resolvedHeight, width: "100%" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Public widgets
 * ---------------------------------------------------------------------- */

export type TickerSymbol = { proName: string; title: string };

const defaultTickers: TickerSymbol[] = [
  { proName: "OANDA:XAUUSD", title: "Gold" },
  { proName: "FX:EURUSD", title: "EUR/USD" },
  { proName: "FX:GBPUSD", title: "GBP/USD" },
  { proName: "FX:USDJPY", title: "USD/JPY" },
  { proName: "TVC:USOIL", title: "WTI Crude" },
  { proName: "OANDA:NAS100USD", title: "NAS100" },
  { proName: "OANDA:SPX500USD", title: "SPX500" },
  { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
  { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
  { proName: "OANDA:XAGUSD", title: "Silver" },
];

export function MiniChart({
  symbol = "OANDA:XAUUSD",
  height = 120,
  className,
  containerClassName,
}: {
  symbol?: string;
  height?: number;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <TradingViewWidget
      widget="mini-symbol-overview"
      height={height}
      label="Loading chart"
      className={className}
      containerClassName={containerClassName ?? "rounded-lg"}
      config={{
        symbol,
        width: "100%",
        height,
        locale: "en",
        dateRange: "1D",
        isTransparent: true,
        autosize: true,
        largeChartUrl: "",
      }}
    />
  );
}

export function TickerTape({
  symbols = defaultTickers,
  className,
}: {
  symbols?: TickerSymbol[];
  className?: string;
}) {
  return (
    <TradingViewWidget
      widget="ticker-tape"
      height={78}
      label="Loading tape"
      className={className}
      containerClassName="rounded-none"
      config={{
        symbols,
        showSymbolLogo: true,
        isTransparent: true,
        displayMode: "adaptive",
        locale: "en",
      }}
    />
  );
}

export function AdvancedChart({
  symbol = "OANDA:XAUUSD",
  interval = "60",
  height = 560,
  className,
  containerClassName,
  studies = [],
}: {
  symbol?: string;
  interval?: string;
  height?: number;
  className?: string;
  containerClassName?: string;
  studies?: string[];
}) {
  return (
    <TradingViewWidget
      widget="advanced-chart"
      height={height}
      label={`Loading ${symbol.split(":").pop() ?? "chart"}`}
      className={className}
      containerClassName={containerClassName}
      config={{
        symbol,
        interval,
        autosize: true,
        timezone: "Etc/UTC",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        withdateranges: true,
        hide_side_toolbar: false,
        details: false,
        studies,
        support_host: "https://www.tradingview.com",
      }}
    />
  );
}

export function MarketOverview({
  height = 520,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <TradingViewWidget
      widget="market-overview"
      height={height}
      label="Loading overview"
      className={className}
      config={{
        showChart: true,
        locale: "en",
        isTransparent: true,
        showSymbolLogo: true,
        showFloatingTooltip: true,
        width: "100%",
        height,
        tabs: [
          {
            title: "Forex",
            symbols: [
              { s: "FX:EURUSD", d: "EUR/USD" },
              { s: "FX:GBPUSD", d: "GBP/USD" },
              { s: "FX:USDJPY", d: "USD/JPY" },
              { s: "FX:AUDUSD", d: "AUD/USD" },
              { s: "FX:USDCAD", d: "USD/CAD" },
            ],
          },
          {
            title: "Metals",
            symbols: [
              { s: "OANDA:XAUUSD", d: "Gold" },
              { s: "OANDA:XAGUSD", d: "Silver" },
              { s: "OANDA:XPTUSD", d: "Platinum" },
            ],
          },
          {
            title: "Indices",
            symbols: [
              { s: "OANDA:NAS100USD", d: "Nasdaq 100" },
              { s: "OANDA:SPX500USD", d: "S&P 500" },
              { s: "OANDA:US30USD", d: "Dow 30" },
              { s: "OANDA:DE30EUR", d: "DAX 40" },
            ],
          },
          {
            title: "Crypto",
            symbols: [
              { s: "BITSTAMP:BTCUSD", d: "Bitcoin" },
              { s: "BITSTAMP:ETHUSD", d: "Ethereum" },
              { s: "BITSTAMP:SOLUSD", d: "Solana" },
            ],
          },
        ],
      }}
    />
  );
}

export function TechnicalAnalysis({
  symbol = "OANDA:XAUUSD",
  interval = "1h",
  height = 440,
  className,
  containerClassName,
}: {
  symbol?: string;
  interval?: string;
  height?: number;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <TradingViewWidget
      widget="technical-analysis"
      height={height}
      label="Loading ratings"
      className={className}
      containerClassName={containerClassName}
      config={{
        symbol,
        interval,
        width: "100%",
        height,
        isTransparent: true,
        showIntervalTabs: true,
        displayMode: "single",
        locale: "en",
      }}
    />
  );
}

export function Screener({
  market = "forex",
  height = 520,
  className,
}: {
  market?: "forex" | "crypto" | "america";
  height?: number;
  className?: string;
}) {
  return (
    <TradingViewWidget
      widget="screener"
      height={height}
      label="Loading screener"
      className={className}
      config={{
        market,
        showToolbar: true,
        defaultColumn: "overview",
        defaultScreen: market === "forex" ? "general" : "most_capitalized",
        isTransparent: true,
        locale: "en",
        width: "100%",
        height,
      }}
    />
  );
}

export function EconomicCalendar({
  height = 540,
  importanceFilter = "0,1",
  className,
}: {
  height?: number;
  /** TradingView importance codes: -1 low, 0 medium, 1 high. */
  importanceFilter?: string;
  className?: string;
}) {
  return (
    <TradingViewWidget
      widget="events"
      height={height}
      label="Loading calendar"
      className={className}
      config={{
        width: "100%",
        height,
        isTransparent: true,
        importanceFilter,
        countryFilter: "us,eu,gb,jp,ca,au,ch,cn",
        locale: "en",
      }}
    />
  );
}

export function SymbolInfo({
  symbol = "OANDA:XAUUSD",
  height = 200,
  className,
}: {
  symbol?: string;
  height?: number;
  className?: string;
}) {
  return (
    <TradingViewWidget
      widget="symbol-info"
      height={height}
      label="Loading symbol"
      className={className}
      config={{
        symbol,
        width: "100%",
        isTransparent: true,
        locale: "en",
      }}
    />
  );
}
