"use client";

import Link from "next/link";
import {
  Bitcoin,
  CandlestickChart,
  ChartColumn,
  DollarSign,
  Flame,
  Gem,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { InstrumentTable } from "@/components/products/instrument-table";
import { Container, Section } from "@/components/ui/container";
import type { MarketInstrument } from "@/db/schema";
import {
  assetClassBlurbs,
  type AssetClass,
} from "@/lib/market";
import { standardLeverageByAssetClass } from "@/lib/leverage";
import { cn } from "@/lib/utils";

export type ProductGroup = {
  assetClass: AssetClass;
  items: MarketInstrument[];
};

type MarketCard = {
  assetClass: AssetClass;
  /** Marketing label on the card (may differ from the specs tab label). */
  title: string;
  body: string;
  Icon: LucideIcon;
};

const marketCards: MarketCard[] = [
  {
    assetClass: "forex",
    title: "Forex",
    body: "Dive into the world's largest financial market and access major, minor and exotic pairs, all in one place.",
    Icon: DollarSign,
  },
  {
    assetClass: "stocks",
    title: "Stocks",
    body: "Trade shares the right way. Choose from thousands of leading stocks across major global exchanges.",
    Icon: ChartColumn,
  },
  {
    assetClass: "metals",
    title: "Metals",
    body: "Make your portfolio shine with gold, silver, and other precious metals.",
    Icon: Gem,
  },
  {
    assetClass: "commodities",
    title: "Energies",
    body: "Fuel your portfolio with popular energies like oil and natural gas at competitive pricing.",
    Icon: Flame,
  },
  {
    assetClass: "indices",
    title: "Indices",
    body: "Gain exposure to entire economies in a single trade with global indices spanning the US, Europe and Asia.",
    Icon: Globe2,
  },
  {
    assetClass: "crypto",
    title: "Crypto",
    body: "Access the big names across digital currencies, including Bitcoin, Ethereum and Solana.",
    Icon: Bitcoin,
  },
];

const tabLabels: Record<AssetClass, string> = {
  forex: "Forex",
  metals: "Metals",
  commodities: "Commodities",
  indices: "Indices",
  crypto: "Crypto",
  stocks: "Stocks",
};

const sessionNotes: Record<AssetClass, string> = {
  forex:
    "Continuous from the Sydney open on Sunday at 21:00 UTC to the New York close on Friday at 21:00 UTC. Rollover is processed at 21:00 UTC each day.",
  metals:
    "Spot metals track the same continuous window as forex, from Sunday 21:00 UTC to Friday 21:00 UTC, priced against the deepest London and Comex venues.",
  commodities:
    "Energy CFDs quote from Sunday 21:00 UTC to Friday 21:00 UTC, so inventory reports and OPEC+ headlines are tradable as they land rather than at the next open.",
  indices:
    "US cash indices quote for 23 hours a day with a one-hour maintenance break at 21:00 UTC. European cash indices follow their primary session, 07:00 to 21:00 UTC. The Nikkei quotes for 22 hours with a two-hour settlement break.",
  crypto:
    "Quoted continuously, including weekends and public holidays. Financing is applied every day rather than on a Monday-to-Friday cycle.",
  stocks:
    "Regular US trading hours only: 13:30 to 20:00 UTC, shifting by one hour when the United States moves to daylight saving. No pre-market or after-hours quoting.",
};

const contractSpecs: Record<AssetClass, string[]> = {
  forex: [
    "1 standard lot = 100,000 units of the base currency",
    "Minimum trade size 0.01 lots, in 0.01 increments",
    "Pip value on a USD-quoted major: $10 per standard lot",
    "Majors quote to 5 decimals and JPY crosses to 3 — the final digit is a fractional pip",
  ],
  metals: [
    "Gold, platinum and palladium: 1 lot = 100 troy ounces",
    "Silver: 1 lot = 5,000 troy ounces",
    "Minimum trade size 0.01 lots",
  ],
  commodities: [
    "WTI and Brent: 1 lot = 1,000 barrels",
    "Natural gas: 1 lot = 10,000 MMBtu",
    "Minimum trade size 0.1 lots on energy",
  ],
  indices: [
    "1 lot = 1 contract, worth one unit of the quote currency per index point",
    "Minimum trade size 0.1 lots",
    "Cash CFDs — no expiry, no roll, financing charged daily",
  ],
  crypto: [
    "1 lot = 1 coin (BTC, ETH or SOL)",
    "Minimum trade size 0.01 lots",
    "Financing applied seven days a week at 21:00 UTC",
  ],
  stocks: [
    "1 lot = 1 share",
    "Minimum trade size 1 share",
    "Corporate actions adjusted on the ex-date; dividends applied as a cash adjustment",
  ],
};

export function ProductsExplorer({ groups }: { groups: ProductGroup[] }) {
  const byClass = useMemo(() => {
    const map = new Map<AssetClass, MarketInstrument[]>();
    for (const group of groups) map.set(group.assetClass, group.items);
    return map;
  }, [groups]);

  const availableCards = marketCards.filter((card) =>
    byClass.has(card.assetClass),
  );

  const tabItems = groups.map((group) => ({
    id: group.assetClass,
    label: tabLabels[group.assetClass],
    count: group.items.length,
  }));

  const [active, setActive] = useState<AssetClass | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as AssetClass;
    if (hash && byClass.has(hash)) setActive(hash);
  }, [byClass]);

  function selectClass(assetClass: AssetClass) {
    setActive(assetClass);
    window.history.replaceState(null, "", `#${assetClass}`);
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const activeGroup = active
    ? groups.find((group) => group.assetClass === active)
    : null;

  return (
    <>
      <Section id="markets" className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {availableCards.map((card) => {
              const isActive = active === card.assetClass;
              const { Icon } = card;
              return (
                <button
                  key={card.assetClass}
                  type="button"
                  onClick={() => selectClass(card.assetClass)}
                  aria-pressed={isActive}
                  className={cn(
                    "group relative flex min-h-[210px] flex-col overflow-hidden rounded-2xl p-7 text-left sm:min-h-[230px] sm:p-8",
                    "bg-[linear-gradient(155deg,#0c1738_0%,#132456_55%,#0f1d45_100%)]",
                    "shadow-[0_16px_36px_-22px_rgb(8_16_40/0.55)]",
                    "ring-1 ring-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3eb4dc] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    isActive && "ring-2 ring-[#3eb4dc]/80",
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_100%,rgb(62_180_220/0.22),transparent_58%)]"
                  />

                  <h3 className="relative z-10 text-[1.625rem] font-semibold tracking-tight text-white sm:text-[1.8rem]">
                    {card.title}
                  </h3>
                  <p className="relative z-10 mt-3 max-w-[17rem] flex-1 text-[0.9375rem] leading-relaxed text-white/70">
                    {card.body}
                  </p>

                  <div className="relative z-10 mt-8 flex items-end justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex h-10 items-center rounded-full bg-white px-4 text-[0.8125rem] font-semibold text-[#0c1738]",
                        "opacity-0 transition-opacity duration-200",
                        "group-hover:opacity-100 group-focus-visible:opacity-100",
                        "[@media(hover:none)]:opacity-100",
                        isActive && "opacity-100",
                      )}
                    >
                      Trade {card.title}
                    </span>
                    <span
                      aria-hidden
                      className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12)] backdrop-blur-sm"
                    >
                      <Icon className="size-5 text-white" strokeWidth={1.75} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Container>
      </Section>

      {activeGroup ? (
        <section
          ref={detailRef}
          id={activeGroup.assetClass}
          aria-labelledby={`${activeGroup.assetClass}-heading`}
          className="scroll-mt-28"
        >
          <div className="border-line-soft bg-bg/85 sticky top-18 z-30 border-y backdrop-blur-md">
            <nav
              aria-label="Instrument classes"
              className="mx-auto flex max-w-page items-center gap-1.5 overflow-x-auto px-5 py-3 sm:px-7 lg:px-8"
            >
              {tabItems.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectClass(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                      isActive
                        ? "border-brand bg-brand/12 text-brand-light"
                        : "border-line text-muted hover:border-brand-light/50 hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span className="tabular font-mono text-[0.625rem] opacity-60">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <Section className="pt-12 sm:pt-14 lg:pt-16">
            <Container>
              <ProductDetail
                assetClass={activeGroup.assetClass}
                instruments={activeGroup.items}
              />
            </Container>
          </Section>
        </section>
      ) : null}
    </>
  );
}

function ProductDetail({
  assetClass,
  instruments,
}: {
  assetClass: AssetClass;
  instruments: MarketInstrument[];
}) {
  const label = tabLabels[assetClass];
  const Icon =
    marketCards.find((card) => card.assetClass === assetClass)?.Icon ??
    CandlestickChart;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-12">
      <div>
        <div className="flex items-center gap-3">
          <span className="border-line-soft bg-sunken text-brand-light grid size-10 place-items-center rounded-xl border">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            {instruments.length} instrument
            {instruments.length === 1 ? "" : "s"}
          </span>
        </div>

        <h2 id={`${assetClass}-heading`} className="text-h3 mt-5">
          {label}
        </h2>
        <p className="text-muted mt-3 leading-relaxed">
          {assetClassBlurbs[assetClass]}
        </p>

        <div className="border-line-soft mt-7 border-t pt-6">
          <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            Standard leverage
          </h3>
          <p className="text-ink mt-2 font-mono text-[0.9375rem] font-semibold">
            {standardLeverageByAssetClass[assetClass]}
          </p>
          <p className="text-muted mt-1.5 text-[0.8125rem] leading-relaxed">
            Account-level Standard ceiling for this asset class. Instrument
            rows below use the same figure.
          </p>
        </div>

        <div className="border-line-soft mt-7 border-t pt-6">
          <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            Contract conventions
          </h3>
          <ul className="mt-3 space-y-2">
            {contractSpecs[assetClass].map((spec) => (
              <li
                key={spec}
                className="text-muted flex gap-2.5 text-[0.8125rem] leading-relaxed"
              >
                <span className="chev mt-1.5 shrink-0" aria-hidden="true" />
                {spec}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-faint mt-6 text-[0.8125rem] leading-relaxed">
          {sessionNotes[assetClass]}
        </p>
      </div>

      <div>
        <InstrumentTable
          assetClass={assetClass}
          instruments={instruments}
          caption={`${label} contract specifications: spread, tick size, leverage and session hours`}
        />
        <p className="text-faint mt-3 text-xs">
          Spreads shown are the typical floor during the London and New York
          overlap. Live pricing for every instrument runs on the{" "}
          <Link href="/markets" className="text-brand-light hover:underline">
            market terminal
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
