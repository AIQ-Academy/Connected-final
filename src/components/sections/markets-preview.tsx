import { ArrowRight } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CandleChart } from "@/components/ui/candle-chart";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MarketInstrument } from "@/db/schema";
import {
  ASSET_CLASSES,
  assetClassLabels,
  simulateQuote,
  type AssetClass,
} from "@/lib/market";
import { cn, formatNumber, priceDecimals } from "@/lib/utils";
import { translate, type DictionaryKey } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

const assetLabelKeys: Record<AssetClass, DictionaryKey> = {
  forex: "asset.forex",
  metals: "asset.metals",
  commodities: "asset.commodities",
  indices: "asset.indices",
  crypto: "asset.crypto",
  stocks: "asset.stocks",
};

function spreadLabel(instrument: MarketInstrument) {
  const { baseSpread, assetClass } = instrument;
  if (assetClass === "forex") return `${formatNumber(baseSpread, 1)} pips`;
  const decimals =
    baseSpread >= 10 ? 0 : baseSpread >= 1 ? 1 : baseSpread >= 0.1 ? 2 : 3;
  return formatNumber(baseSpread, decimals);
}

type ClassCard = {
  assetClass: AssetClass;
  label: string;
  count: number;
  spread: string;
  symbol: string;
  changePct: number;
  price: number;
  high: number;
  low: number;
  history: number[];
};

function summarise(instruments: MarketInstrument[]): ClassCard[] {
  return ASSET_CLASSES.flatMap((assetClass) => {
    const rows = instruments.filter((row) => row.assetClass === assetClass);
    const lead = rows[0];
    if (!lead) return [];
    const quote = simulateQuote(lead);
    return [
      {
        assetClass,
        label: assetClassLabels[assetClass],
        count: rows.length,
        spread: spreadLabel(lead),
        symbol: lead.symbol,
        changePct: quote.changePct,
        price: quote.price,
        high: quote.dayHigh,
        low: quote.dayLow,
        history: quote.history,
      },
    ];
  });
}

function price(value: number) {
  return formatNumber(value, priceDecimals(value));
}

function ChangeChip({
  changePct,
  size = "sm",
}: {
  changePct: number;
  size?: "sm" | "md";
}) {
  const up = changePct >= 0;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center rounded-full font-mono font-medium",
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[0.6875rem]",
        up ? "bg-mint/12 text-mint" : "bg-loss/12 text-loss",
      )}
    >
      {up ? "+" : ""}
      {formatNumber(changePct, 2)}%
    </span>
  );
}

/**
 * Bento rather than a six-up grid: the lead pair gets a full terminal panel,
 * two classes get half panels, and the tail sits in a watchlist rail. Every
 * chart is the same simulated series the /markets terminal renders.
 */
export function MarketsPreviewSection({
  instruments,
  locale,
}: {
  instruments: MarketInstrument[];
  locale: Locale;
}) {
  const t = (key: DictionaryKey) => translate(locale, key);
  const cards = summarise(instruments);
  const [featured, ...rest] = cards;
  const secondary = rest.slice(0, 2);
  const rail = rest.slice(2);

  if (!featured) return null;

  return (
    <Section
      id="markets"
      size="spacious"
      className="section-wash border-line-soft bg-sunken/50 overflow-hidden border-y"
    >
      <Container>
        <SectionHeading
          eyebrow={t("home.assets.eyebrow")}
          title={t("home.markets.title")}
          lead={t("home.markets.lead")}
          action={
            <ButtonLink href="/markets" variant="soft">
              {t("home.assets.marketTerminal")}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-4 sm:mt-16 lg:mt-20 lg:grid-cols-12 lg:gap-5">
          <Reveal className="lg:col-span-7">
            <article className="widget-wash border-line bg-panel group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-300 hover:border-brand/40">
              <header className="border-line-soft bg-sunken/60 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:gap-6 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h3 className="font-display text-ink text-xl font-semibold sm:text-2xl">
                    {t(assetLabelKeys[featured.assetClass])}
                  </h3>
                  <p className="text-faint mt-1.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    {featured.symbol}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="font-display text-ink tabular text-2xl leading-none font-semibold sm:text-[1.75rem]">
                    {price(featured.price)}
                  </p>
                  <div className="mt-2">
                    <ChangeChip changePct={featured.changePct} size="md" />
                  </div>
                </div>
              </header>

              <div className="flex-1 px-3 pt-5 pb-4 sm:px-4">
                <CandleChart
                  closes={featured.history}
                  chartId={featured.assetClass}
                  candleCount={30}
                  showAxis
                  showVolume
                  className="h-full min-h-[15rem] w-full sm:min-h-[17rem]"
                />
              </div>

              <dl className="border-line-soft bg-line-soft grid grid-cols-3 gap-px border-t">
                <Metric
                  label={t("home.assets.tightSpread")}
                  value={`${t("home.assets.from")} ${featured.spread}`}
                  tone="mint"
                />
                <Metric label={t("home.assets.sessionHigh")} value={price(featured.high)} />
                <Metric label={t("home.assets.sessionLow")} value={price(featured.low)} />
              </dl>
            </article>
          </Reveal>

          <div className="relative lg:col-span-5">
            <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
              {t("home.assets.swipeClasses")}
            </p>
            <div className="mobile-snap-rail gap-4 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 lg:grid-rows-2 lg:gap-5">
            {secondary.map((card, index) => (
              <Reveal
                key={card.assetClass}
                delay={0.08 * (index + 1)}
                className="mobile-snap-card min-w-0 w-[min(82vw,20rem)] sm:w-auto"
              >
                <article className="border-line bg-panel group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-300 hover:border-brand/40">
                  <header className="flex items-start justify-between gap-4 px-5 pt-5">
                    <div className="min-w-0">
                      <h3 className="font-display text-ink text-lg font-semibold">
                        {t(assetLabelKeys[card.assetClass])}
                      </h3>
                      <p className="text-faint mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                        {card.symbol}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-ink tabular font-mono text-sm font-medium">
                        {price(card.price)}
                      </p>
                      <div className="mt-1.5">
                        <ChangeChip changePct={card.changePct} />
                      </div>
                    </div>
                  </header>

                  <div className="flex-1 px-3 pt-4 sm:px-4">
                    <CandleChart
                      closes={card.history}
                      chartId={card.assetClass}
                      candleCount={24}
                      className="h-full min-h-[6.5rem] w-full"
                    />
                  </div>

                  <p className="text-faint border-line-soft mt-4 border-t px-5 py-3 font-mono text-[0.6875rem]">
                    {t("home.assets.tightSpread")} {" "}
                    <span className="text-mint tabular">
                      {t("home.assets.from")} {card.spread}
                    </span>
                  </p>
                </article>
              </Reveal>
            ))}
            </div>
          </div>
        </div>

        {rail.length > 0 && (
          <div className="relative mt-4 lg:mt-5">
            <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
              {t("home.assets.moreMarkets")}
            </p>
            <StaggerGroup
              role="list"
              className="mobile-snap-rail border-line bg-line-soft gap-3 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:rounded-2xl sm:border lg:grid-cols-3"
            >
              {rail.map((card, index) => (
                <StaggerItem
                  role="listitem"
                  key={card.assetClass}
                  className={cn(
                    "mobile-snap-card bg-panel hover:bg-sunken/50 flex w-[min(88vw,22rem)] items-center gap-4 rounded-xl border border-line px-5 py-4 transition-colors duration-300 sm:w-auto sm:rounded-none sm:border-0",
                    index === rail.length - 1 &&
                      rail.length % 2 === 1 &&
                      "sm:col-span-2 lg:col-span-1",
                  )}
                >
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-ink text-sm font-semibold">
                    {t(assetLabelKeys[card.assetClass])}
                  </h3>
                  <p className="text-faint mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    {card.symbol}
                  </p>
                  <p className="text-mint tabular mt-1.5 font-mono text-[0.625rem]">
                    {t("home.assets.from")} {card.spread}
                  </p>
                </div>

                <CandleChart
                  closes={card.history}
                  chartId={`rail-${card.assetClass}`}
                  candleCount={10}
                  className="h-11 w-24 shrink-0"
                />

                <div className="shrink-0 text-end">
                  <p className="text-ink tabular font-mono text-[0.8125rem] font-medium">
                    {price(card.price)}
                  </p>
                  <p
                    className={cn(
                      "tabular mt-1.5 font-mono text-[0.6875rem]",
                      card.changePct >= 0 ? "text-mint" : "text-loss",
                    )}
                  >
                    {card.changePct >= 0 ? "+" : ""}
                    {formatNumber(card.changePct, 2)}%
                  </p>
                </div>
              </StaggerItem>
            ))}
            </StaggerGroup>
          </div>
        )}

        <Reveal delay={0.12}>
          <p className="text-faint mt-6 text-xs leading-relaxed">
            {t("home.assets.disclaimer")}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "mint";
}) {
  return (
    <div className="bg-panel px-4 py-3.5 sm:px-5 sm:py-4">
      <dt className="text-faint font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "tabular mt-1.5 font-mono text-[0.8125rem]",
          tone === "mint" ? "text-mint" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
