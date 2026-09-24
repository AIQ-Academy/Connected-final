/**
 * Shared market-data contracts plus the deterministic price engine that backs
 * `/api/market/quotes` when no upstream provider key is configured.
 *
 * The simulator is intentionally *not* `Math.random()`. Every value is a pure
 * function of (symbol, timestamp), so two requests a second apart produce a
 * smooth continuation rather than a jump, the sparkline agrees with the last
 * printed price, and server and client never disagree after hydration.
 */

export const ASSET_CLASSES = [
  "forex",
  "metals",
  "commodities",
  "indices",
  "crypto",
  "stocks",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

export const assetClassLabels: Record<AssetClass, string> = {
  forex: "Forex",
  metals: "Metals",
  commodities: "Commodities",
  indices: "Indices",
  crypto: "Crypto",
  stocks: "Stocks",
};

export const assetClassBlurbs: Record<AssetClass, string> = {
  forex:
    "Majors, minors and exotics streamed from tier-1 bank liquidity, with raw spreads from 0.0 pips through the London and New York sessions.",
  metals:
    "Gold, silver, platinum and palladium priced against the deepest spot venues, with no widening mandate around scheduled releases.",
  commodities:
    "WTI and Brent crude plus natural gas, quoted continuously so inventory prints and OPEC+ headlines are tradable as they land.",
  indices:
    "Cash index CFDs on the US, European and Asian benchmarks, covering 23 hours a day across five days.",
  crypto:
    "Bitcoin, Ethereum and Solana against the dollar, quoted 24/7 including weekends when every other asset class is shut.",
  stocks:
    "Share CFDs on the highest-turnover US large caps, executed against the primary listing venue during regular trading hours.",
};

export type Quote = {
  symbol: string;
  displayName: string;
  tvSymbol: string;
  assetClass: AssetClass;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  decimals: number;
  history: number[];
  /** "live" when sourced from an upstream provider, "simulated" otherwise. */
  source: "live" | "simulated";
};

export type QuotesResponse = {
  quotes: Quote[];
  asOf: string;
  source: "live" | "simulated";
};

/**
 * Reference levels the simulator oscillates around. Chosen to sit in the
 * plausible range for each instrument so the grid never looks broken.
 */
export const anchorPrices: Record<string, number> = {
  "EUR/USD": 1.0862,
  "GBP/USD": 1.2734,
  "USD/JPY": 151.22,
  "AUD/USD": 0.6588,
  "USD/CHF": 0.8974,
  "USD/CAD": 1.3641,
  "NZD/USD": 0.6042,
  "EUR/GBP": 0.853,
  "GBP/JPY": 192.58,
  "XAU/USD": 2431.85,
  "XAG/USD": 28.94,
  "XPT/USD": 968.4,
  "XPD/USD": 1024.5,
  WTI: 78.42,
  BRENT: 82.66,
  NATGAS: 2.418,
  US30: 39812,
  NAS100: 18290,
  SPX500: 5218.6,
  GER40: 18134,
  UK100: 8142.5,
  JP225: 39104,
  "BTC/USD": 61204,
  "ETH/USD": 3412.6,
  "SOL/USD": 148.72,
  AAPL: 214.36,
  NVDA: 121.84,
  TSLA: 246.9,
  AMZN: 186.42,
};

/** Daily volatility budget as a fraction of price, by asset class. */
const volatilityByClass: Record<AssetClass, number> = {
  forex: 0.0045,
  metals: 0.009,
  commodities: 0.016,
  indices: 0.008,
  crypto: 0.032,
  stocks: 0.014,
};

/** Stable 32-bit hash so each symbol gets its own reproducible phase set. */
function hashSymbol(symbol: string) {
  let hash = 2166136261;
  for (let i = 0; i < symbol.length; i += 1) {
    hash ^= symbol.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

/** Price precision derived from the instrument's pip size. */
export function decimalsForPip(pipSize: number) {
  const fromPip = Math.round(-Math.log10(pipSize)) + 1;
  return Math.min(6, Math.max(1, fromPip));
}

/**
 * Continuous, differentiable pseudo-price. Three sine components at
 * incommensurate periods (roughly 17 min, 2.4 h and 19 h) sum into a curve
 * that wanders like a real tape without ever drifting off its anchor.
 */
function oscillation(seed: number, timeMs: number) {
  const t = timeMs / 1000;
  const tau = Math.PI * 2;
  return (
    0.52 * Math.sin(tau * (t / 1019 + seed)) +
    0.31 * Math.sin(tau * (t / 8737 + seed * 3.7)) +
    0.17 * Math.sin(tau * (t / 68_339 + seed * 11.3))
  );
}

function priceAt(
  symbol: string,
  anchor: number,
  assetClass: AssetClass,
  timeMs: number,
) {
  const seed = hashSymbol(symbol);
  const amplitude = volatilityByClass[assetClass] ?? 0.008;
  return anchor * (1 + amplitude * oscillation(seed, timeMs));
}

const HISTORY_POINTS = 32;
const HISTORY_INTERVAL_MS = 6 * 60 * 1000;

export type SimulatorInput = {
  symbol: string;
  displayName: string;
  tvSymbol: string;
  assetClass: AssetClass;
  pipSize: number;
  baseSpread: number;
};

/** Builds a full quote for one instrument at a point in time. */
export function simulateQuote(
  instrument: SimulatorInput,
  now = Date.now(),
): Quote {
  const anchor = anchorPrices[instrument.symbol] ?? 100;
  const decimals = decimalsForPip(instrument.pipSize);

  const price = priceAt(instrument.symbol, anchor, instrument.assetClass, now);

  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const open = priceAt(
    instrument.symbol,
    anchor,
    instrument.assetClass,
    dayStart.getTime(),
  );

  const history: number[] = [];
  for (let i = HISTORY_POINTS - 1; i >= 0; i -= 1) {
    history.push(
      priceAt(
        instrument.symbol,
        anchor,
        instrument.assetClass,
        now - i * HISTORY_INTERVAL_MS,
      ),
    );
  }

  // Intraday extremes sampled at a finer grain than the sparkline so the
  // high/low always bracket the printed price.
  let dayHigh = price;
  let dayLow = price;
  const elapsed = now - dayStart.getTime();
  const samples = 48;
  for (let i = 0; i <= samples; i += 1) {
    const sampled = priceAt(
      instrument.symbol,
      anchor,
      instrument.assetClass,
      dayStart.getTime() + (elapsed * i) / samples,
    );
    if (sampled > dayHigh) dayHigh = sampled;
    if (sampled < dayLow) dayLow = sampled;
  }

  const spread =
    instrument.baseSpread * instrument.pipSize * 10 || price * 4e-5;
  const change = price - open;

  return {
    symbol: instrument.symbol,
    displayName: instrument.displayName,
    tvSymbol: instrument.tvSymbol,
    assetClass: instrument.assetClass,
    price,
    bid: price - spread / 2,
    ask: price + spread / 2,
    spread,
    change,
    changePct: (change / open) * 100,
    dayHigh,
    dayLow,
    decimals,
    history,
    source: "simulated",
  };
}

/**
 * Illustrative session clock. Spot FX runs from Sunday 21:00 UTC to Friday
 * 21:00 UTC; crypto never closes.
 */
export function isMarketOpen(now = new Date()) {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (day === 6) return false;
  if (day === 0 && hour < 21) return false;
  if (day === 5 && hour >= 21) return false;
  return true;
}

export function marketStatusLabel(now = new Date()) {
  return isMarketOpen(now)
    ? "Markets open · live pricing"
    : "Markets closed · reopens Sunday 21:00 UTC";
}
