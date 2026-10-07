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
 * MetaApi exposes an MT5 account's current bid/ask through a server-side REST
 * endpoint. Keep the token and account id server-only; only normalized quotes
 * are returned to the browser.
 */
type Mt5Price = {
  bid?: number;
  ask?: number;
  time?: string;
};

function mt5Config() {
  const token = process.env.MT5_METAAPI_TOKEN;
  const accountId = process.env.MT5_METAAPI_ACCOUNT_ID;
  if (!token || !accountId) return null;

  const region = process.env.MT5_METAAPI_REGION ?? "new-york";
  const baseUrl =
    process.env.MT5_METAAPI_BASE_URL ??
    `https://mt-client-api-v1.${region}.agiliumtrade.ai`;
  let symbolMap: Record<string, string> = {};
  try {
    symbolMap = process.env.MT5_SYMBOL_MAP
      ? (JSON.parse(process.env.MT5_SYMBOL_MAP) as Record<string, string>)
      : {};
  } catch {
    console.warn("[market] MT5_SYMBOL_MAP is not valid JSON; using site symbols");
  }

  return { token, accountId, baseUrl, symbolMap };
}

async function fetchMt5Quotes(
  instruments: SimulatorInput[],
): Promise<Map<string, Partial<Quote>> | null> {
  const config = mt5Config();
  if (!config || instruments.length === 0) return null;

  const result = new Map<string, Partial<Quote>>();
  await Promise.all(
    instruments.map(async (instrument) => {
      const symbol = config.symbolMap[instrument.symbol] ?? instrument.symbol;
      const url = `${config.baseUrl}/users/current/accounts/${encodeURIComponent(config.accountId)}/symbols/${encodeURIComponent(symbol)}/current-price`;
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json", "auth-token": config.token },
          signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
          next: { revalidate: QUOTES_REVALIDATE_SECONDS },
        });
        if (!response.ok) return;
        const raw = (await response.json()) as Mt5Price;
        const bid = Number(raw.bid);
        const ask = Number(raw.ask);
        if (!Number.isFinite(bid) || !Number.isFinite(ask) || bid <= 0 || ask <= 0) return;
        result.set(instrument.symbol, {
          price: (bid + ask) / 2,
          bid,
          ask,
          spread: ask - bid,
        });
      } catch (error) {
        console.error(`[market] MT5 quote failed for ${instrument.symbol}`, error);
      }
    }),
  );
  return result.size ? result : null;
}

/** Optional legacy provider, retained only as a non-MT5 fallback for installs
 * that have not configured the MT5 bridge yet. It is never used when MT5 is
 * configured, so production MT5 deployments always read the broker's prices.
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

async function fetchLegacyProviderQuotes(
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
    const payload = (await response.json()) as Record<string, ProviderQuote> & ProviderQuote;
    const result = new Map<string, Partial<Quote>>();
    instruments.forEach((instrument, index) => {
      const raw = instruments.length === 1 ? (payload as ProviderQuote) : payload[providerSymbols[index]];
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
    console.error("[market] fallback provider failed, using simulator", error);
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
      .sort((a, b) => symbols.indexOf(a.symbol) - symbols.indexOf(b.symbol));
  }

  const now = Date.now();
  const hasMt5 = Boolean(mt5Config());
  const upstream = hasMt5
    ? await fetchMt5Quotes(instruments)
    : await fetchLegacyProviderQuotes(instruments);
  const quotes: Quote[] = instruments.map((instrument) => {
    const simulated = simulateQuote(instrument, now);
    const live = upstream?.get(instrument.symbol);
    if (!live?.price) return simulated;
    const scale = live.price / simulated.price;
    const spread = live.spread ?? simulated.spread * scale;
    return {
      ...simulated,
      ...live,
      price: live.price,
      bid: live.bid ?? live.price - spread / 2,
      ask: live.ask ?? live.price + spread / 2,
      spread,
      history: simulated.history.map((point) => point * scale),
      source: "live" as const,
    };
  });
  const liveCount = quotes.filter((quote) => quote.source === "live").length;
  return {
    quotes,
    asOf: new Date(now).toISOString(),
    source: liveCount ? "live" : "simulated",
    provider: liveCount && hasMt5 ? "mt5" : liveCount ? "market-data" : "simulated",
  } as QuotesResponse & { provider: "mt5" | "market-data" | "simulated" };
}
