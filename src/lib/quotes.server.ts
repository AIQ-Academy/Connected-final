import "server-only";

import { getInstruments } from "@/db/queries";
import {
  simulateQuote,
  type AssetClass,
  type Quote,
  type QuotesResponse,
  type SimulatorInput,
} from "@/lib/market";

/** Shared by the quotes route and by pages that need a server-rendered grid. */
export const QUOTES_REVALIDATE_SECONDS = 5;

const PROVIDER_TIMEOUT_MS = 3500;

/**
 * Twelve Data already accepts `EUR/USD`, `XAU/USD` and bare equity tickers, so
 * only the synthetic CFD codes need translating.
 */
const providerSymbolOverrides: Record<string, string> = {
  WTI: "WTI/USD",
  BRENT: "BRENT/USD",
  NATGAS: "NG/USD",
  US30: "DJI",
  NAS100: "IXIC",
  SPX500: "SPX",
  GER40: "DAX",
  UK100: "UKX",
  JP225: "N225",
};

type ProviderQuote = {
  close?: string;
  change?: string;
  percent_change?: string;
  high?: string;
  low?: string;
};

/**
 * Best-effort upstream fetch. Any failure — absent key, rate limit, partial
 * coverage — degrades to the simulator instead of failing the request, and the
 * API key never crosses the network boundary to the browser.
 */
async function fetchLiveQuotes(
  instruments: SimulatorInput[],
): Promise<Map<string, Partial<Quote>> | null> {
  const key = process.env.MARKET_DATA_API_KEY;
  if (!key || instruments.length === 0) return null;

  const providerSymbols = instruments.map(
    (instrument) => providerSymbolOverrides[instrument.symbol] ?? instrument.symbol,
  );

  const url = new URL("https://api.twelvedata.com/quote");
  url.searchParams.set("symbol", providerSymbols.join(","));
  url.searchParams.set("apikey", key);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      next: { revalidate: QUOTES_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as Record<string, ProviderQuote> &
      ProviderQuote;
    const result = new Map<string, Partial<Quote>>();

    instruments.forEach((instrument, index) => {
      const raw =
        instruments.length === 1
          ? (payload as ProviderQuote)
          : payload[providerSymbols[index]];
      const price = Number(raw?.close);
      if (!raw || !Number.isFinite(price) || price <= 0) return;

      const change = Number(raw.change);
      const changePct = Number(raw.percent_change);
      const high = Number(raw.high);
      const low = Number(raw.low);

      result.set(instrument.symbol, {
        price,
        change: Number.isFinite(change) ? change : 0,
        changePct: Number.isFinite(changePct) ? changePct : 0,
        dayHigh: Number.isFinite(high) ? high : price,
        dayLow: Number.isFinite(low) ? low : price,
      });
    });

    return result.size ? result : null;
  } catch (error) {
    console.error("[market] provider fetch failed, using simulator", error);
    return null;
  }
}

export async function loadQuotes({
  assetClass,
  symbols,
}: {
  assetClass?: string | null;
  symbols?: string[] | null;
} = {}): Promise<QuotesResponse> {
  const rows = await getInstruments();

  let instruments: SimulatorInput[] = rows.map((row) => ({
    symbol: row.symbol,
    displayName: row.displayName,
    tvSymbol: row.tvSymbol,
    assetClass: row.assetClass as AssetClass,
    pipSize: Number(row.pipSize),
    baseSpread: Number(row.baseSpread),
  }));

  if (assetClass && assetClass !== "all") {
    instruments = instruments.filter((i) => i.assetClass === assetClass);
  }
  if (symbols?.length) {
    const wanted = new Set(symbols);
    instruments = instruments
      .filter((i) => wanted.has(i.symbol))
      // Preserve the caller's ordering so hero watchlists stay curated.
      .sort((a, b) => symbols.indexOf(a.symbol) - symbols.indexOf(b.symbol));
  }

  const now = Date.now();
  const live = await fetchLiveQuotes(instruments);

  const quotes: Quote[] = instruments.map((instrument) => {
    const simulated = simulateQuote(instrument, now);
    const upstream = live?.get(instrument.symbol);
    if (!upstream?.price) return simulated;

    // Free provider tiers do not return an intraday series, so the simulated
    // sparkline shape is rescaled onto the live level rather than discarded.
    const scale = upstream.price / simulated.price;
    const spread = simulated.spread * scale;

    return {
      ...simulated,
      ...upstream,
      price: upstream.price,
      bid: upstream.price - spread / 2,
      ask: upstream.price + spread / 2,
      spread,
      history: simulated.history.map((point) => point * scale),
      source: "live" as const,
    };
  });

  return {
    quotes,
    asOf: new Date(now).toISOString(),
    source: quotes.some((quote) => quote.source === "live") ? "live" : "simulated",
  };
}
