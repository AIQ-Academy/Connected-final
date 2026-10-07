import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ChartWorkbench, type ChartSymbol } from "@/components/market/chart-workbench";
import { QuoteGrid } from "@/components/market/quote-grid";
import {
  EconomicCalendar,
  MarketOverview,
  TechnicalAnalysis,
} from "@/components/market/tradingview";
import { MarketHotNewsSection } from "@/components/sections/market-hot-news";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { Reveal } from "@/components/motion/reveal";
import { MarketStatus } from "@/components/sections/hero/market-status";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments, getNews } from "@/db/queries";
import { loadQuotes } from "@/lib/quotes.server";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { pageCopy } from "@/lib/i18n/page-copy";

export const metadata: Metadata = {
  title: "Market Terminal",
  description:
    "Live quotes, TradingView charting, technical ratings and the economic calendar — every instrument tradable on a Connect Funded account, in one terminal.",
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

export default async function MarketsPage() {
  const [{ quotes }, instruments, news, locale] = await Promise.all([
    loadQuotes(),
    getInstruments(),
    getNews(6),
    getServerLocale(),
  ]);
  const t = (key: Parameters<typeof pageCopy>[1]) => pageCopy(locale, key);
  const sectionNav = [
    { href: "#quotes", label: t("market.quotes") },
    { href: "#charts", label: t("market.charts") },
    { href: "#calendar", label: t("market.calendar") },
    { href: "#news", label: t("market.hotNews") },
    { href: "#ratings", label: t("market.ratings") },
  ];

  const bySymbol = new Map(instruments.map((i) => [i.symbol, i]));
  const chartSymbols: ChartSymbol[] = FEATURED_SYMBOLS.flatMap((symbol) => {
    const instrument = bySymbol.get(symbol);
    return instrument
      ? [{ label: instrument.symbol, tvSymbol: instrument.tvSymbol }]
      : [];
  });
  return (
    <>
      <section className="relative isolate flex min-h-[650px] items-center overflow-hidden py-24 sm:min-h-[720px] sm:py-28">
        <FeaturePageImage
          src="/images/Market1.jpg"
          motionVariant="markets"
          alt={locale === "ar" ? "شاشات تعرض أسواق الفوركس والأسهم والعملات الرقمية والسلع" : locale === "fr" ? "Des écrans affichent les marchés du forex, des actions, des cryptomonnaies et des matières premières" : "Screens displaying forex, stock, cryptocurrency and commodity markets"}
        />
        <Aurora intensity="medium" />
        <GridBackdrop />
        <Container className="relative">
          <div>
          <Reveal direction="none" className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">
              <span className="chev" />
              {t("market.terminal")}
            </span>
            <MarketStatus />
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-5 max-w-3xl text-white">
              {t("market.heroTitle")}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-lead mt-5 max-w-2xl text-white/80">
              {t("market.heroLead")}
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {t("market.create")}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/products" variant="soft" size="lg">
              {t("market.specs")}
            </ButtonLink>
          </Reveal>

          <nav
            aria-label={t("market.nav")}
            className="mt-10 flex flex-wrap gap-2 border-t border-white/20 pt-6"
          >
            {sectionNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/30 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-white/85 uppercase transition-colors hover:border-white/70 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          </div>

        </Container>
      </section>

      <Section id="quotes" className="pt-16 sm:pt-20">
        <Container>
          <SectionHeading
            eyebrow={t("market.liveQuotes")}
            title={t("market.quoteTitle")}
            lead={t("market.quoteLead")}
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
            eyebrow={t("market.charts")}
            title={t("market.chartTitle")}
            lead={t("market.chartLead")}
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
            eyebrow={t("market.calendar")}
            title={t("market.calendarTitle")}
            lead={t("market.calendarLead")}
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
            eyebrow={t("market.technical")}
            title={t("market.technicalTitle")}
            lead={t("market.technicalLead")}
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

      <Section
        id="overview"
        className="border-line-soft bg-raised/50 relative overflow-hidden border-t"
      >
        <GridBackdrop className="opacity-60" />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <SectionHeading
                eyebrow={t("market.overview")}
                title={t("market.allAssets")}
                lead={t("market.overviewLead")}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={signupUrl} size="lg">
                  {t("market.create")}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/products" variant="soft" size="lg">
                  {t("market.allInstruments")}
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
