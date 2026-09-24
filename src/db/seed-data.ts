/**
 * Canonical content for the site. Seeded into Postgres, and also imported
 * directly by the AI chatbot so its answers can never drift from what the
 * marketing pages claim.
 */

import { fundingFaqs } from "@/lib/funding-faq";

export const tierSeed = [
  {
    code: "starter",
    name: "Starter",
    accountSize: 10_000,
    price: 99,
    phase1TargetPct: 10,
    phase2TargetPct: 5,
    maxDailyDrawdownPct: 5,
    maxOverallDrawdownPct: 10,
    minTradingDays: 4,
    profitSplitPct: 80,
    payoutFrequency: "bi-weekly",
    maxLeverage: "1:100",
    isFeatured: false,
    sortOrder: 1,
  },
  {
    code: "essential",
    name: "Essential",
    accountSize: 25_000,
    price: 189,
    phase1TargetPct: 10,
    phase2TargetPct: 5,
    maxDailyDrawdownPct: 5,
    maxOverallDrawdownPct: 10,
    minTradingDays: 4,
    profitSplitPct: 80,
    payoutFrequency: "bi-weekly",
    maxLeverage: "1:100",
    isFeatured: false,
    sortOrder: 2,
  },
  {
    code: "growth",
    name: "Growth",
    accountSize: 50_000,
    price: 299,
    phase1TargetPct: 10,
    phase2TargetPct: 5,
    maxDailyDrawdownPct: 5,
    maxOverallDrawdownPct: 10,
    minTradingDays: 4,
    profitSplitPct: 85,
    payoutFrequency: "bi-weekly",
    maxLeverage: "1:100",
    isFeatured: true,
    sortOrder: 3,
  },
  {
    code: "advanced",
    name: "Advanced",
    accountSize: 100_000,
    price: 499,
    phase1TargetPct: 9,
    phase2TargetPct: 5,
    maxDailyDrawdownPct: 5,
    maxOverallDrawdownPct: 10,
    minTradingDays: 4,
    profitSplitPct: 85,
    payoutFrequency: "bi-weekly",
    maxLeverage: "1:100",
    isFeatured: false,
    sortOrder: 4,
  },
  {
    code: "professional",
    name: "Professional",
    accountSize: 200_000,
    price: 899,
    phase1TargetPct: 8,
    phase2TargetPct: 4,
    maxDailyDrawdownPct: 5,
    maxOverallDrawdownPct: 10,
    minTradingDays: 4,
    profitSplitPct: 90,
    payoutFrequency: "weekly",
    maxLeverage: "1:100",
    isFeatured: false,
    sortOrder: 5,
  },
] as const;

type AssetClass =
  | "forex"
  | "metals"
  | "commodities"
  | "indices"
  | "crypto"
  | "stocks";

export const instrumentSeed: {
  symbol: string;
  displayName: string;
  tvSymbol: string;
  assetClass: AssetClass;
  pipSize: number;
  baseSpread: number;
  maxLeverage: string;
  tradingHours: string;
  sortOrder: number;
}[] = [
  // ---- Forex ----
  { symbol: "EUR/USD", displayName: "Euro / US Dollar", tvSymbol: "FX:EURUSD", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.0, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 1 },
  { symbol: "GBP/USD", displayName: "Pound / US Dollar", tvSymbol: "FX:GBPUSD", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.1, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 2 },
  { symbol: "USD/JPY", displayName: "US Dollar / Yen", tvSymbol: "FX:USDJPY", assetClass: "forex", pipSize: 0.01, baseSpread: 0.1, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 3 },
  { symbol: "AUD/USD", displayName: "Aussie / US Dollar", tvSymbol: "FX:AUDUSD", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.2, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 4 },
  { symbol: "USD/CHF", displayName: "US Dollar / Swiss Franc", tvSymbol: "FX:USDCHF", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.2, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 5 },
  { symbol: "USD/CAD", displayName: "US Dollar / Canadian Dollar", tvSymbol: "FX:USDCAD", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.3, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 6 },
  { symbol: "NZD/USD", displayName: "Kiwi / US Dollar", tvSymbol: "FX:NZDUSD", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.4, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 7 },
  { symbol: "EUR/GBP", displayName: "Euro / Pound", tvSymbol: "FX:EURGBP", assetClass: "forex", pipSize: 0.0001, baseSpread: 0.3, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 8 },
  { symbol: "GBP/JPY", displayName: "Pound / Yen", tvSymbol: "FX:GBPJPY", assetClass: "forex", pipSize: 0.01, baseSpread: 0.6, maxLeverage: "1:100", tradingHours: "24/5", sortOrder: 9 },

  // ---- Precious metals ----
  { symbol: "XAU/USD", displayName: "Gold Spot", tvSymbol: "OANDA:XAUUSD", assetClass: "metals", pipSize: 0.01, baseSpread: 0.12, maxLeverage: "1:50", tradingHours: "24/5", sortOrder: 20 },
  { symbol: "XAG/USD", displayName: "Silver Spot", tvSymbol: "OANDA:XAGUSD", assetClass: "metals", pipSize: 0.001, baseSpread: 0.018, maxLeverage: "1:50", tradingHours: "24/5", sortOrder: 21 },
  { symbol: "XPT/USD", displayName: "Platinum Spot", tvSymbol: "OANDA:XPTUSD", assetClass: "metals", pipSize: 0.01, baseSpread: 1.4, maxLeverage: "1:20", tradingHours: "24/5", sortOrder: 22 },
  { symbol: "XPD/USD", displayName: "Palladium Spot", tvSymbol: "OANDA:XPDUSD", assetClass: "metals", pipSize: 0.01, baseSpread: 2.8, maxLeverage: "1:20", tradingHours: "24/5", sortOrder: 23 },

  // ---- Commodities ----
  { symbol: "WTI", displayName: "Crude Oil WTI", tvSymbol: "TVC:USOIL", assetClass: "commodities", pipSize: 0.01, baseSpread: 0.03, maxLeverage: "1:20", tradingHours: "24/5", sortOrder: 30 },
  { symbol: "BRENT", displayName: "Crude Oil Brent", tvSymbol: "TVC:UKOIL", assetClass: "commodities", pipSize: 0.01, baseSpread: 0.03, maxLeverage: "1:20", tradingHours: "24/5", sortOrder: 31 },
  { symbol: "NATGAS", displayName: "Natural Gas", tvSymbol: "TVC:NATGAS", assetClass: "commodities", pipSize: 0.001, baseSpread: 0.008, maxLeverage: "1:20", tradingHours: "24/5", sortOrder: 32 },

  // ---- Indices ----
  { symbol: "US30", displayName: "Dow Jones 30", tvSymbol: "OANDA:US30USD", assetClass: "indices", pipSize: 1, baseSpread: 1.6, maxLeverage: "1:50", tradingHours: "23/5", sortOrder: 40 },
  { symbol: "NAS100", displayName: "Nasdaq 100", tvSymbol: "OANDA:NAS100USD", assetClass: "indices", pipSize: 0.1, baseSpread: 1.0, maxLeverage: "1:50", tradingHours: "23/5", sortOrder: 41 },
  { symbol: "SPX500", displayName: "S&P 500", tvSymbol: "OANDA:SPX500USD", assetClass: "indices", pipSize: 0.1, baseSpread: 0.4, maxLeverage: "1:50", tradingHours: "23/5", sortOrder: 42 },
  { symbol: "GER40", displayName: "DAX 40", tvSymbol: "OANDA:DE30EUR", assetClass: "indices", pipSize: 0.1, baseSpread: 0.9, maxLeverage: "1:50", tradingHours: "14/5", sortOrder: 43 },
  { symbol: "UK100", displayName: "FTSE 100", tvSymbol: "OANDA:UK100GBP", assetClass: "indices", pipSize: 0.1, baseSpread: 1.0, maxLeverage: "1:50", tradingHours: "14/5", sortOrder: 44 },
  { symbol: "JP225", displayName: "Nikkei 225", tvSymbol: "OANDA:JP225USD", assetClass: "indices", pipSize: 1, baseSpread: 7, maxLeverage: "1:50", tradingHours: "22/5", sortOrder: 45 },

  // ---- Crypto ----
  { symbol: "BTC/USD", displayName: "Bitcoin", tvSymbol: "BITSTAMP:BTCUSD", assetClass: "crypto", pipSize: 0.01, baseSpread: 18, maxLeverage: "1:5", tradingHours: "24/7", sortOrder: 50 },
  { symbol: "ETH/USD", displayName: "Ethereum", tvSymbol: "BITSTAMP:ETHUSD", assetClass: "crypto", pipSize: 0.01, baseSpread: 2.4, maxLeverage: "1:5", tradingHours: "24/7", sortOrder: 51 },
  { symbol: "SOL/USD", displayName: "Solana", tvSymbol: "BITSTAMP:SOLUSD", assetClass: "crypto", pipSize: 0.01, baseSpread: 0.28, maxLeverage: "1:5", tradingHours: "24/7", sortOrder: 52 },

  // ---- Share CFDs ----
  { symbol: "AAPL", displayName: "Apple Inc.", tvSymbol: "NASDAQ:AAPL", assetClass: "stocks", pipSize: 0.01, baseSpread: 0.02, maxLeverage: "1:10", tradingHours: "6.5/5", sortOrder: 60 },
  { symbol: "NVDA", displayName: "NVIDIA Corp.", tvSymbol: "NASDAQ:NVDA", assetClass: "stocks", pipSize: 0.01, baseSpread: 0.03, maxLeverage: "1:10", tradingHours: "6.5/5", sortOrder: 61 },
  { symbol: "TSLA", displayName: "Tesla Inc.", tvSymbol: "NASDAQ:TSLA", assetClass: "stocks", pipSize: 0.01, baseSpread: 0.04, maxLeverage: "1:10", tradingHours: "6.5/5", sortOrder: 62 },
  { symbol: "AMZN", displayName: "Amazon.com Inc.", tvSymbol: "NASDAQ:AMZN", assetClass: "stocks", pipSize: 0.01, baseSpread: 0.03, maxLeverage: "1:10", tradingHours: "6.5/5", sortOrder: 63 },
];

export const testimonialSeed = [
  {
    authorName: "Marwan Haddad",
    authorTitle: "Funded trader",
    country: "United Arab Emirates",
    quote:
      "The evaluation rules were clear from day one and the first payout landed exactly on schedule. That alone puts Connect Funded ahead of the two firms I traded with before.",
    rating: 5,
    accountSize: 100_000,
    payoutAmount: 8_420,
    sortOrder: 1,
  },
  {
    authorName: "Renée Fontaine",
    authorTitle: "Funded trader",
    country: "France",
    quote:
      "Support answered a KYC question inside the portal in under four minutes. I have waited days elsewhere for the same thing.",
    rating: 5,
    accountSize: 50_000,
    payoutAmount: 3_190,
    sortOrder: 2,
  },
  {
    authorName: "Amara Osei",
    authorTitle: "Funded trader",
    country: "Ghana",
    quote:
      "Spreads on gold through the London and New York overlap are noticeably tighter here, and they do not blow out the moment news prints.",
    rating: 5,
    accountSize: 200_000,
    payoutAmount: 21_760,
    sortOrder: 3,
  },
  {
    authorName: "Lukas Novak",
    authorTitle: "Funded trader",
    country: "Czechia",
    quote:
      "I scaled from a $10K starter to a $200K account in under six months. The scaling plan is published up front, so I knew exactly what I was working toward.",
    rating: 5,
    accountSize: 200_000,
    payoutAmount: 14_305,
    sortOrder: 4,
  },
  {
    authorName: "Priya Raghunathan",
    authorTitle: "Funded trader",
    country: "Singapore",
    quote:
      "No time limit on phase two changed everything for me. I stopped forcing trades to hit an arbitrary deadline and my win rate went up.",
    rating: 5,
    accountSize: 50_000,
    payoutAmount: 5_640,
    sortOrder: 5,
  },
  {
    authorName: "Diego Ferreira",
    authorTitle: "Funded trader",
    country: "Brazil",
    quote:
      "Payout requested Monday morning, in my account Tuesday. No hoops, no surprise clauses buried in the terms.",
    rating: 5,
    accountSize: 25_000,
    payoutAmount: 2_180,
    sortOrder: 6,
  },
];

export const faqSeed = fundingFaqs.map(
  ({ category, question, answer, sortOrder }) => ({
    category,
    question,
    answer,
    sortOrder,
  }),
);

export const newsSeed = [
  {
    slug: "gold-holds-near-highs-as-rate-cut-bets-firm",
    category: "Market Analysis",
    title: "Gold holds near record highs as rate-cut bets firm up",
    excerpt:
      "Positioning ahead of the next Fed decision is quietly reshaping XAU/USD flows. Here is where the desk sees liquidity building.",
    author: "Connect Funded Desk",
    readMinutes: 5,
    daysAgo: 1,
  },
  {
    slug: "eurusd-rangebound-ahead-of-ecb",
    category: "Forex",
    title: "EUR/USD compresses into the ECB — what a breakout would mean",
    excerpt:
      "Realised volatility has collapsed into the event. We map the levels that matter on both sides and the risk of a false break.",
    author: "Connect Funded Desk",
    readMinutes: 4,
    daysAgo: 2,
  },
  {
    slug: "crude-inventories-what-traders-watch",
    category: "Commodities",
    title: "Crude inventories: the numbers traders actually watch",
    excerpt:
      "Supply data and OPEC+ signalling are pulling WTI in opposite directions. A short guide to reading the report as it prints.",
    author: "Connect Funded Desk",
    readMinutes: 6,
    daysAgo: 4,
  },
  {
    slug: "risk-management-drawdown-survival",
    category: "Education",
    title: "The drawdown maths most funded traders get wrong",
    excerpt:
      "A 10% loss needs an 11.1% gain to recover. At 30% it takes 42.9%. Why position sizing beats prediction every time.",
    author: "Connect Funded Desk",
    readMinutes: 7,
    daysAgo: 6,
  },
  {
    slug: "nasdaq-breadth-narrowing",
    category: "Indices",
    title: "Nasdaq breadth is narrowing again — and that matters",
    excerpt:
      "Index strength is increasingly carried by a handful of names. What thinning participation means for NAS100 continuation.",
    author: "Connect Funded Desk",
    readMinutes: 5,
    daysAgo: 8,
  },
  {
    slug: "session-overlap-liquidity-guide",
    category: "Education",
    title: "Trading the London–New York overlap without getting chopped",
    excerpt:
      "The four hours with the deepest liquidity of the day are also the most punishing for late entries. A practical framework.",
    author: "Connect Funded Desk",
    readMinutes: 6,
    daysAgo: 11,
  },
];

/** Recurring weekly calendar shape, materialised relative to the seed date. */
export const calendarSeed = [
  { dayOffset: 0, hour: 8, minute: 30, currency: "USD", title: "Non-Farm Payrolls", impact: "high", forecast: "185K", previous: "175K" },
  { dayOffset: 0, hour: 12, minute: 30, currency: "USD", title: "Unemployment Rate", impact: "high", forecast: "4.1%", previous: "4.1%" },
  { dayOffset: 0, hour: 14, minute: 0, currency: "CAD", title: "Ivey PMI", impact: "low", forecast: "52.4", previous: "51.9" },
  { dayOffset: 1, hour: 10, minute: 0, currency: "EUR", title: "ECB Interest Rate Decision", impact: "high", forecast: "3.75%", previous: "3.75%" },
  { dayOffset: 1, hour: 10, minute: 45, currency: "EUR", title: "ECB Press Conference", impact: "high", forecast: null, previous: null },
  { dayOffset: 1, hour: 23, minute: 50, currency: "JPY", title: "BoJ Summary of Opinions", impact: "low", forecast: null, previous: null },
  { dayOffset: 2, hour: 7, minute: 0, currency: "GBP", title: "GDP m/m", impact: "medium", forecast: "0.2%", previous: "0.1%" },
  { dayOffset: 2, hour: 14, minute: 30, currency: "USD", title: "Crude Oil Inventories", impact: "medium", forecast: "-1.4M", previous: "-2.1M" },
  { dayOffset: 3, hour: 12, minute: 30, currency: "USD", title: "Core CPI m/m", impact: "high", forecast: "0.3%", previous: "0.2%" },
  { dayOffset: 3, hour: 18, minute: 0, currency: "USD", title: "FOMC Statement", impact: "high", forecast: "5.50%", previous: "5.50%" },
  { dayOffset: 4, hour: 1, minute: 30, currency: "AUD", title: "Employment Change", impact: "medium", forecast: "22.5K", previous: "17.9K" },
  { dayOffset: 4, hour: 9, minute: 0, currency: "EUR", title: "German Ifo Business Climate", impact: "medium", forecast: "88.9", previous: "88.6" },
  { dayOffset: 5, hour: 12, minute: 30, currency: "USD", title: "Retail Sales m/m", impact: "high", forecast: "0.4%", previous: "0.1%" },
  { dayOffset: 6, hour: 8, minute: 0, currency: "CHF", title: "SNB Policy Rate", impact: "medium", forecast: "1.25%", previous: "1.50%" },
] as const;
