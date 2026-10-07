/**
 * Marketing content for each tradable asset class.
 *
 * The *data* for an asset class (instruments, pip sizes, spreads, leverage)
 * already lives in `instrumentSeed`, and the *simulation* lives in
 * `lib/market`. This module holds only the copy and the per-class framing that
 * the `/trade/[asset]` pages and the homepage grid render — so adding an asset
 * class means adding instruments in one place and a card here, and every
 * surface picks it up.
 */

import { instrumentSeed } from "@/db/seed-data";
import { ASSET_CLASSES, assetClassLabels, type AssetClass } from "@/lib/market";

export type AssetClassContent = {
  /** URL segment under `/trade`. */
  slug: AssetClass;
  label: string;
  /** One line for cards and nav descriptions. */
  tagline: string;
  /** Hero paragraph on the asset-class page. */
  lead: string;
  /** Headline number shown on the card, e.g. "0.0 pips". */
  statValue: string;
  statLabel: string;
  /** Session coverage, shown on the card and in the spec strip. */
  hours: string;
  /** Typical retail leverage ceiling for the class. */
  leverage: string;
  /** Three reasons to trade the class — rendered as a feature row. */
  highlights: { title: string; body: string }[];
  /** Answers the "what moves this market" question on the page. */
  drivers: string[];
  /** Tailwind-safe accent used for the card wash and icon. */
  accent: "brand" | "amber" | "mint" | "accent" | "loss";
};

export const assetClassContent: Record<AssetClass, AssetClassContent> = {
  forex: {
    slug: "forex",
    label: "Forex",
    tagline: "Majors, minors and exotics on tier-1 bank liquidity.",
    lead: "The largest market in the world, quoted continuously from the Sydney open to the New York close. Trade majors from 0.0 pips, with the same pricing through the London fix and the New York session that you get at 3am.",
    statValue: "0.0",
    statLabel: "pips from",
    hours: "24/5",
    leverage: "Up to 1:100",
    accent: "brand",
    highlights: [
      {
        title: "Raw interbank pricing",
        body: "Quotes are aggregated from tier-1 bank and non-bank liquidity, streamed without a dealing-desk markup on the spread.",
      },
      {
        title: "No widening mandate",
        body: "Spreads are not administratively widened around scheduled releases. If liquidity thins, the book shows it — and nothing else does.",
      },
      {
        title: "Deep session coverage",
        body: "Continuous pricing across the Asian, European and US sessions, with the overlap hours carrying the tightest books of the day.",
      },
    ],
    drivers: [
      "Central bank policy decisions and the rate path priced into forward curves",
      "Inflation, employment and GDP releases from the two economies in the pair",
      "Risk sentiment, which reliably bids the dollar, yen and franc in a drawdown",
      "Cross-border flow around month-end and the 4pm London fix",
    ],
  },
  metals: {
    slug: "metals",
    label: "Metals",
    tagline: "Gold, silver, platinum and palladium against the deepest spot venues.",
    lead: "Precious metals sit between a currency and a commodity, and they trade like both. Gold and silver price off the same spot venues the bullion market uses, with leverage up to 1:50 and no overnight gap risk from a futures roll.",
    statValue: "0.12",
    statLabel: "typical XAU spread",
    hours: "24/5",
    leverage: "Up to 1:200",
    accent: "amber",
    highlights: [
      {
        title: "Spot, not futures",
        body: "Metals are quoted as spot CFDs, so there is no contract expiry to roll and no calendar spread to price into your position.",
      },
      {
        title: "The portfolio hedge",
        body: "Gold has historically carried a low or negative correlation to equity indices, which is why it bids when risk assets do not.",
      },
      {
        title: "Genuine 24/5 depth",
        body: "Liquidity persists through the Asian session rather than thinning to a token quote, so Asia-hours strategies are tradable.",
      },
    ],
    drivers: [
      "Real yields — gold pays no coupon, so it competes directly with inflation-adjusted rates",
      "Dollar strength, since metals are dollar-denominated globally",
      "Central bank reserve buying, which has been the dominant structural bid",
      "Industrial demand, which drives silver, platinum and palladium far more than gold",
    ],
  },
  indices: {
    slug: "indices",
    label: "Indices",
    tagline: "Trade the UT100-20 (Nasdaq 100) alongside leading global benchmarks.",
    lead: "Trade the UT100-20 (Nasdaq 100) and the benchmarks that set global risk sentiment. One ticket gives you exposure to an entire index, without the single-stock earnings risk that comes with picking a name.",
    statValue: "0.4",
    statLabel: "typical SPX500 spread",
    hours: "23/5",
    leverage: "Up to 1:200",
    accent: "accent",
    highlights: [
      {
        title: "Cash, not futures",
        body: "Cash index pricing tracks the underlying benchmark directly, with no basis to the front-month future and no quarterly roll.",
      },
      {
        title: "Nearly round the clock",
        body: "US benchmarks price for 23 hours a day, so an overnight headline is something you can trade rather than gap into.",
      },
      {
        title: "Diversified by construction",
        body: "A single index position spreads risk across every constituent, which is why it behaves very differently from a share CFD.",
      },
    ],
    drivers: [
      "Rate expectations, which reprice equity valuations before they touch earnings",
      "Earnings season, where a handful of mega-caps now dominate the US benchmarks",
      "Sector rotation between growth and value as the cycle turns",
      "Geopolitical risk, which hits European and Asian benchmarks first",
    ],
  },
  commodities: {
    slug: "commodities",
    label: "Energies",
    tagline: "WTI, Brent and natural gas at competitive, continuous pricing.",
    lead: "Energy is the most headline-sensitive market on the board. WTI, Brent and natural gas are quoted continuously, so an inventory print or an OPEC+ statement is tradable as it lands rather than at the next open.",
    statValue: "0.03",
    statLabel: "typical WTI spread",
    hours: "24/5",
    leverage: "Up to 1:200",
    accent: "loss",
    highlights: [
      {
        title: "Both crude benchmarks",
        body: "WTI and Brent are quoted side by side, so the spread between them is a position you can express directly.",
      },
      {
        title: "Event-driven by nature",
        body: "Weekly inventory data and OPEC+ decisions move the market in seconds — pricing stays live through both.",
      },
      {
        title: "Real inflation exposure",
        body: "Energy feeds directly into headline inflation, which makes it a cleaner macro hedge than most assets marketed as one.",
      },
    ],
    drivers: [
      "OPEC+ production quotas and the degree of compliance with them",
      "Weekly US crude and natural gas inventory reports",
      "Supply disruption from conflict, sanctions or weather",
      "Global growth expectations, which set the demand side of the balance",
    ],
  },
  crypto: {
    slug: "crypto",
    label: "Crypto (CFDs)",
    tagline: "Bitcoin, Ethereum and Solana — quoted through the weekend.",
    lead: "Digital asset CFDs let you take a directional position long or short without custody, wallets or exchange withdrawal limits. Pricing runs 24/7, including the weekend, when every other asset class on the board is shut.",
    statValue: "24/7",
    statLabel: "including weekends",
    hours: "24/7",
    leverage: "Up to 1:200",
    accent: "mint",
    highlights: [
      {
        title: "No custody risk",
        body: "You trade the price. There is no wallet to secure, no seed phrase to lose and no exchange balance to withdraw.",
      },
      {
        title: "Short as easily as long",
        body: "A CFD is symmetric, so expressing a bearish view takes the same ticket as a bullish one — no borrow required.",
      },
      {
        title: "Weekend coverage",
        body: "Crypto is the only class here that prices on Saturday and Sunday, which is precisely when it tends to move.",
      },
    ],
    drivers: [
      "Global liquidity conditions, which crypto tracks more closely than any narrative admits",
      "Regulatory decisions and spot ETF flows in the major jurisdictions",
      "Network events such as halvings, upgrades and large protocol migrations",
      "Leverage build-up across venues, which turns ordinary moves into liquidation cascades",
    ],
  },
  stocks: {
    slug: "stocks",
    label: "Shares",
    tagline: "Share CFDs on the highest-turnover US large caps.",
    lead: "Trade the individual names that drive the benchmarks. Share CFDs price against the primary listing venue through the US regular session, with leverage up to 1:100 and no minimum share size.",
    statValue: "Up to 1:100",
    statLabel: "max leverage",
    hours: "6.5/5",
    leverage: "Up to 1:200",
    accent: "brand",
    highlights: [
      {
        title: "Fractional by default",
        body: "Position size is set in lots rather than whole shares, so a four-figure name does not force a four-figure ticket.",
      },
      {
        title: "Long or short",
        body: "Bearish positions need no stock borrow and carry no recall risk, which is the main practical barrier to shorting cash equity.",
      },
      {
        title: "Priced at the primary venue",
        body: "Quotes reference the primary listing exchange during regular hours rather than a thin secondary print.",
      },
    ],
    drivers: [
      "Quarterly earnings and, more often, the forward guidance attached to them",
      "Sector and index flows, which move constituents regardless of company news",
      "Analyst revisions and the positioning that front-runs them",
      "Rate expectations, which hit long-duration growth names hardest",
    ],
  },
};

/** Nav/grid order — highest-interest classes first. */
export const assetClassOrder: AssetClass[] = [
  "forex",
  "metals",
  "indices",
  "commodities",
  "crypto",
  "stocks",
];

export const assetClassList: AssetClassContent[] = assetClassOrder.map(
  (slug) => assetClassContent[slug],
);

export function isAssetClass(value: string): value is AssetClass {
  return (ASSET_CLASSES as readonly string[]).includes(value);
}

export function assetClassHref(slug: AssetClass) {
  return `/trade/${slug}` as const;
}

/** Instruments belonging to a class, in their seeded display order. */
export function instrumentsForClass(slug: AssetClass) {
  return instrumentSeed
    .filter((instrument) => instrument.assetClass === slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function instrumentCountForClass(slug: AssetClass) {
  return instrumentsForClass(slug).length;
}

export { assetClassLabels };
