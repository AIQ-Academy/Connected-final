"use client";

import {
  ArrowRight,
  Bitcoin,
  CandlestickChart,
  ChartNoAxesColumnIncreasing,
  Coins,
  Building2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type ComponentType, type KeyboardEvent } from "react";

import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  assetClassHref,
  assetClassList,
} from "@/lib/asset-classes";
import type { AssetClass } from "@/lib/market";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const assetCopyKeys: Record<AssetClass, { label: DictionaryKey; tagline: DictionaryKey; stat: DictionaryKey }> = {
  forex: { label: "asset.forex", tagline: "asset.forex.tagline", stat: "asset.pipsFrom" },
  metals: { label: "asset.metals", tagline: "asset.metals.tagline", stat: "asset.typicalXau" },
  indices: { label: "asset.indices", tagline: "asset.indices.tagline", stat: "asset.typicalSpx" },
  commodities: { label: "asset.commodities", tagline: "asset.commodities.tagline", stat: "asset.typicalWti" },
  crypto: { label: "asset.crypto", tagline: "asset.crypto.tagline", stat: "asset.weekend" },
  stocks: { label: "asset.stocks", tagline: "asset.stocks.tagline", stat: "asset.maxLeverage" },
};

type FocusMarket = {
  id: string;
  classes: AssetClass[];
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

// Energy and metals share a single market focus card, as in the supplied design.
const focusMarkets: FocusMarket[] = [
  { id: "forex", classes: ["forex"], Icon: CandlestickChart },
  { id: "stocks", classes: ["stocks"], Icon: Building2 },
  { id: "indices", classes: ["indices"], Icon: ChartNoAxesColumnIncreasing },
  { id: "metals-energy", classes: ["metals", "commodities"], Icon: Coins },
  { id: "crypto", classes: ["crypto"], Icon: Bitcoin },
];

const marketByClass = Object.fromEntries(assetClassList.map((market) => [market.slug, market]));

const focusColors: Record<string, string> = {
  forex: "var(--cf-market-forex)",
  stocks: "var(--cf-market-stocks)",
  indices: "var(--cf-market-indices)",
  "metals-energy": "var(--cf-market-metals)",
  crypto: "var(--cf-market-crypto)",
};

export function AssetClassGrid({
  id = "markets",
  heading = true,
}: {
  id?: string;
  heading?: boolean;
}) {
  const { t, locale, direction } = useLocale();
  const [activeId, setActiveId] = useState("forex");
  const tabId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, focusMarkets.findIndex((market) => market.id === activeId));
  const active = focusMarkets[activeIndex];
  const activeMarkets = active.classes.map((slug) => marketByClass[slug]);
  const ActiveIcon = active.Icon;
  const label = active.id === "metals-energy"
    ? `${t("asset.metals")} ${locale === "ar" ? "و" : "&"} ${t("asset.commodities")}`
    : t(assetCopyKeys[active.classes[0]].label);
  const description = active.id === "metals-energy"
    ? t("home.assets.metalsEnergyDescription")
    : activeMarkets.map((market) => t(assetCopyKeys[market.slug].tagline)).join(" ");
  const leverage = [...new Set(activeMarkets.map((market) => market.leverage))].join(" / ");

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % focusMarkets.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + focusMarkets.length) % focusMarkets.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = focusMarkets.length - 1;
    else return;
    event.preventDefault();
    setActiveId(focusMarkets[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <Section id={id} size="spacious" className="bg-[var(--cf-section-blue)] scroll-mt-28 isolate">
      <Container>
        {heading && (
          <SectionHeading
            eyebrow={t("home.assets.eyebrow")}
            title={t("home.assets.title")}
            lead={t("home.assets.lead")}
          />
        )}

        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.55fr)] lg:gap-5">
          <div
            role="tablist"
            aria-label={t("home.assets.title")}
            aria-orientation="vertical"
            className="flex flex-col gap-2.5"
          >
            {focusMarkets.map((market, index) => {
              const Icon = market.Icon;
              const selected = market.id === active.id;
              const marketLabel = market.id === "metals-energy"
                ? `${t("asset.metals")} ${locale === "ar" ? "و" : "&"} ${t("asset.commodities")}`
                : t(assetCopyKeys[market.classes[0]].label);
              return (
                <button
                  key={market.id}
                  ref={(element) => { tabRefs.current[index] = element; }}
                  id={`${tabId}-tab-${market.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${tabId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(market.id)}
                  onKeyDown={(event) => moveTab(event, index)}
                  className={cn(
                    "group flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 text-start transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cf-palette-5)]",
                    selected
                      ? "border-transparent text-white shadow-[0_12px_28px_-18px_var(--cf-brand)]"
                      : "border-line-soft bg-panel text-ink hover:border-[color-mix(in_srgb,var(--cf-palette-5)_45%,var(--cf-border))] hover:bg-[var(--cf-card-highlight)]",
                  )}
                  style={selected ? { background: focusColors[market.id] } : undefined}
                >
                  <Icon className={cn("size-5 shrink-0", selected ? "text-white" : "text-brand-light")} aria-hidden="true" />
                  <span className="flex-1 text-sm font-semibold sm:text-base">{marketLabel}</span>
                  <ArrowRight className={cn("size-4 shrink-0 transition-transform", direction === "rtl" ? "rotate-180" : "group-hover:translate-x-0.5")} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div
            id={`${tabId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabId}-tab-${active.id}`}
            tabIndex={0}
            className="cf-interactive-card relative isolate flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/15 p-6 text-white shadow-[0_24px_55px_-30px_rgb(var(--cf-brand-glow)/.7)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-palette-6)] sm:p-8 lg:min-h-[25.5rem] lg:p-10"
            style={{
                background: focusColors[active.id],
            }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -end-12 -z-10 text-white/[0.12]">
              <CandlestickChart className="size-56 sm:size-64" strokeWidth={1.2} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-inner sm:size-14">
                <ActiveIcon className="size-6 sm:size-7" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="rounded-full border border-white/25 bg-white/[0.08] px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.16em] text-white/85 uppercase sm:text-[0.625rem]">
                {locale === "ar" ? `تركيز السوق ${String(activeIndex + 1).padStart(2, "0")}` : locale === "fr" ? `FOCUS MARCHÉ ${String(activeIndex + 1).padStart(2, "0")}` : `MARKET FOCUS ${String(activeIndex + 1).padStart(2, "0")}`}
              </span>
            </div>

            <div className="mt-auto pt-12 sm:pt-16">
              <h3 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">{label}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{description}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/95 sm:grid-cols-1 sm:gap-4">
              {[
                  `${t("home.assets.leverage")}: ${leverage}`,
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--cf-palette-6)]" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {active.classes.map((slug) => (
                  <Link
                    key={slug}
                    href={slug === "crypto" ? "/register?type=broker" : assetClassHref(slug)}
                    target={slug === "crypto" ? "_blank" : undefined}
                    rel={slug === "crypto" ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--cf-brand)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t("asset.trade")} {t(assetCopyKeys[slug].label)}
                    <ArrowRight className={cn("size-4", direction === "rtl" && "rotate-180")} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-faint mt-7 text-center text-sm">
          {t("home.assets.spreadsNote")} {" "}
          <Link href="/trading/conditions" className="text-brand-light hover:underline">
            {t("home.assets.specSheet")}
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
