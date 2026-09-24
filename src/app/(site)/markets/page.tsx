import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ChartWorkbench, type ChartSymbol } from "@/components/market/chart-workbench";
import { QuoteGrid } from "@/components/market/quote-grid";
import {
  EconomicCalendar,
  MarketOverview,
  Screener,
  TechnicalAnalysis,
  TickerTape,
} from "@/components/market/tradingview";
import { MarketHotNewsSection } from "@/components/sections/market-hot-news";
import { Reveal } from "@/components/motion/reveal";
import { MarketStatus } from "@/components/sections/hero/market-status";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments, getNews } from "@/db/queries";
import { loadQuotes } from "@/lib/quotes.server";
import { signupUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Market Terminal",
  description:
    "Live quotes, TradingView charting, technical ratings, a multi-market screener and the economic calendar — every instrument tradable on a Connect Funded account, in one terminal.",
};

/** The terminal is data-heavy; revalidate often enough to feel current. */
export const revalidate = 30;

const FEATURED_SYMBOLS = [
  "XAU/USD",
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "NAS100",
  "SPX500",
  "US30",
  "WTI",
  "BTC/USD",
  "ETH/USD",
];

const sectionNav = [
  { href: "#quotes", label: "Quotes" },
  { href: "#charts", label: "Charts" },
  { href: "#calendar", label: "Calendar" },
  { href: "#news", label: "Hot news" },
  { href: "#ratings", label: "Ratings" },
  { href: "#screener", label: "Screener" },
];

export default async function MarketsPage() {
  const [{ quotes }, instruments, news] = await Promise.all([
    loadQuotes(),
    getInstruments(),
    getNews(6),
  ]);

  const bySymbol = new Map(instruments.map((i) => [i.symbol, i]));
  const chartSymbols: ChartSymbol[] = FEATURED_SYMBOLS.flatMap((symbol) => {
    const instrument = bySymbol.get(symbol);
    return instrument
      ? [{ label: instrument.symbol, tvSymbol: instrument.tvSymbol }]
      : [];
  });

  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-12 sm:pt-20">
        <Aurora intensity="medium" />
        <GridBackdrop />
        <Container className="relative">
          <Reveal direction="none" className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">
              <span className="chev" />
              Market terminal
            </span>
            <MarketStatus />
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-5 max-w-3xl">
              Every market we fund, on one screen.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-5 max-w-2xl">
              Live indicative quotes across forex, metals, energy, indices,
              share CFDs and crypto, alongside full TradingView charting,
              technical ratings, a cross-market screener and the week&rsquo;s
              scheduled releases.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={signupUrl} size="lg">
              Create account
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/products" variant="soft" size="lg">
              Full instrument specs
            </ButtonLink>
          </Reveal>

          <nav
            aria-label="Terminal sections"
            className="border-line-soft mt-10 flex flex-wrap gap-2 border-t pt-6"
          >
            {sectionNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="border-line text-muted hover:text-ink hover:border-brand-light/60 rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <div className="border-line-soft bg-raised/60 border-y">
        <TickerTape />
      </div>

      <Section id="quotes" className="pt-16 sm:pt-20">
        <Container>
          <SectionHeading
            eyebrow="Live quotes"
            title="Indicative pricing across every asset class."
            lead="Filter by class, sort any column, and expand a row for the day range, spread and net change. Prices refresh automatically while the tab is in focus."
          />
          <Reveal delay={0.08} className="mt-9">
            <QuoteGrid initialQuotes={quotes} />
          </Reveal>
        </Container>
      </Section>

      <Section
        id="charts"
        className="border-line-soft bg-raised/50 relative overflow-hidden border-y"
      >
        <GridBackdrop className="opacity-60" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Charts"
            title="Full TradingView charting."
            lead="Drawing tools, indicators, saved templates and every timeframe from 15 minutes to weekly, on the instruments you can trade from a funded account."
          />
          <Reveal delay={0.08} className="mt-8">
            <ChartWorkbench
              symbols={chartSymbols}
              initialQuotes={quotes.filter((quote) =>
                FEATURED_SYMBOLS.includes(quote.symbol),
              )}
              height={620}
            />
          </Reveal>
        </Container>
      </Section>

      <Section id="calendar">
        <Container>
          <SectionHeading
            eyebrow="Economic calendar"
            title="Every release that moves a funded account."
            lead="High and medium impact events across the US, euro area, UK, Japan, Canada, Australia, Switzerland and China. Connect Funded places no restriction on trading through a scheduled release."
          />
          <Reveal delay={0.08} className="mt-9">
            <div className="border-line-soft bg-panel overflow-hidden rounded-3xl border p-2 sm:p-3">
              <EconomicCalendar height={620} importanceFilter="0,1" />
            </div>
          </Reveal>
        </Container>
      </Section>

      <MarketHotNewsSection
        id="news"
        articles={news}
        variant="compact"
        showViewAll={false}
      />

      <Section
        id="ratings"
        className="border-line-soft bg-raised/50 relative overflow-hidden border-y"
      >
        <GridBackdrop className="opacity-60" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Technical ratings"
            title="Multi-timeframe consensus, side by side."
            lead="Oscillator and moving-average ratings aggregated across timeframes. Useful as a bias check, never as a substitute for your own plan."
          />
          <Reveal delay={0.08} className="mt-9">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { symbol: "OANDA:XAUUSD", title: "Gold" },
                { symbol: "FX:EURUSD", title: "EUR/USD" },
                { symbol: "OANDA:NAS100USD", title: "Nasdaq 100" },
              ].map((item) => (
                <div
                  key={item.symbol}
                  className="border-line-soft bg-panel overflow-hidden rounded-3xl border"
                >
                  <div className="border-line-soft border-b px-5 py-3.5">
                    <p className="text-ink font-display text-sm font-semibold">
                      {item.title}
                    </p>
                    <p className="text-faint font-mono text-[0.6875rem]">
                      {item.symbol}
                    </p>
                  </div>
                  <TechnicalAnalysis
                    symbol={item.symbol}
                    height={420}
                    className="p-2"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="screener">
        <Container>
          <SectionHeading
            eyebrow="Screener"
            title="Scan the movers before the session opens."
            lead="Rank by change, volatility, volume or technical rating across more than a thousand symbols, then bring the shortlist back to your funded account."
          />
          <Reveal delay={0.08} className="mt-9">
            <div className="border-line-soft bg-panel overflow-hidden rounded-3xl border p-2 sm:p-3">
              <Screener market="forex" height={620} />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section
        id="overview"
        className="border-line-soft bg-raised/50 relative overflow-hidden border-t"
      >
        <GridBackdrop className="opacity-60" />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Market overview"
                title="One book, six asset classes."
                lead="Forex, metals, indices and crypto all clear through the same bridge into the same funded account. No separate permissions, no per-class add-ons."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={signupUrl} size="lg">
                  Create account
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/products" variant="soft" size="lg">
                  See every instrument
                </ButtonLink>
              </div>
            </div>
            <Reveal delay={0.08}>
              <div className="border-line-soft bg-panel overflow-hidden rounded-3xl border p-2">
                <MarketOverview height={520} />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
