"use client";

import { BookOpen, ChartNoAxesCombined, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { HeroFilm } from "@/components/sections/hero/film-backdrop";
import { StageItem, StageLine, landingMotion } from "@/components/sections/hero/parts";
import { Container } from "@/components/ui/container";
import { useIntroStage } from "@/lib/home-intro";
import type { HomeHeroContent } from "@/lib/cms/schemas";
import { homeHero as heroDefaults } from "@/lib/landing/home";
import { useLocale, type Locale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

/** Full-screen homepage hero with the interactive market card from the design. */
export function HomeHero({ content }: { content?: HomeHeroContent } = {}) {
  const { locale, t } = useLocale();
  const hero = localizedHero(content, locale, t);
  const reduced = useReducedMotion();
  const introStage = useIntroStage(true);
  const contentIn = reduced || introStage === "settled";

  return (
    <section
      data-hero-stage=""
      aria-label={[hero.title[0], hero.title[1]].join(" ")}
      className="relative isolate h-svh min-h-[34rem] overflow-hidden bg-[var(--cf-hero-bg)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <HeroFilm />
      </div>
      <HeroScrim />
      <div className="relative h-full px-0 pt-20 pb-8 sm:pt-24 sm:pb-10">
        <Container className="relative z-10 mx-auto h-full w-full max-w-6xl lg:px-10">
          <motion.div
            variants={landingMotion}
            initial={false}
            animate={contentIn ? "center" : "enter"}
            className="grid h-full items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16"
          >
            <div className="flex h-full flex-col justify-center text-white">
              <StageItem>
                <p className="mb-4 flex items-center gap-3 font-mono text-[0.5625rem] font-semibold tracking-[0.2em] text-white/75 uppercase sm:mb-6 sm:text-[0.625rem]">
                  <span className="grid size-9 place-items-center rounded-xl border border-white/25 bg-white/10 text-cyan-200 backdrop-blur">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  {hero.eyebrow}
                </p>
              </StageItem>
              <h1 className="max-w-[11ch] font-display text-[clamp(2.8rem,6.1vw,5.75rem)] leading-[0.94] font-semibold tracking-[-0.055em] text-white drop-shadow-[0_2px_24px_rgb(0_0_0/0.55)]">
                <StageLine>{hero.title[0]}</StageLine>
                <StageLine className="mt-1">{hero.title[1]}</StageLine>
              </h1>
              <StageItem className="mt-5 max-w-lg sm:mt-6">
                <p className="text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                  {hero.lead}
                </p>
              </StageItem>
              <StageItem className="mt-7 sm:mt-auto">
                <div className="grid max-w-xl grid-cols-3 items-start border-t border-white/20 pt-4 sm:pt-5">
                  {[t("home.hero.featureConditions"), t("home.hero.featureMarkets"), t("home.hero.featureSupport")].map((item, index) => (
                    <div key={index} className="min-w-0 border-white/20 px-2 first:ps-0 not-first:border-s sm:px-4">
                      <span className="block font-mono text-[0.5625rem] font-semibold leading-4 tracking-[0.12em] text-cyan-200 sm:text-[0.625rem]">0{index + 1}</span>
                      <p className="mt-2 max-w-[10rem] text-[0.625rem] leading-4 text-white/80 sm:text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </StageItem>
            </div>

            <StageItem className="mx-auto w-full max-w-[29rem] lg:max-w-none">
              <HeroMarketCard />
            </StageItem>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}

function HeroScrim() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--cf-hero-rgb)/0.88)_0%,rgb(var(--cf-hero-rgb)/0.68)_36%,rgb(var(--cf-hero-rgb)/0.4)_72%,rgb(var(--cf-hero-rgb)/0.46)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[var(--cf-hero-scrim-90)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--cf-hero-bg)]/70 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_140px_rgb(var(--cf-hero-rgb)/0.55)]" />
    </div>
  );
}

const heroMarkets = [
  { id: "forex", labelKey: "market.forex", symbol: "EUR/USD", quote: "1.0842", move: "+0.42%", session: "London", line: "0,78 30,58 55,68 86,43 113,52 146,28 177,41 210,19 244,31 278,12 312,20 350,4" },
  { id: "indices", labelKey: "market.indices", symbol: "NAS100", quote: "18,426.3", move: "+0.31%", session: "New York", line: "0,80 30,68 55,72 86,50 113,59 146,34 177,42 210,22 244,31 278,17 312,21 350,8" },
  { id: "metals", labelKey: "market.metals", symbol: "XAU/USD", quote: "2,354.80", move: "+0.68%", session: "London", line: "0,74 30,69 55,49 86,58 113,41 146,48 177,29 210,36 244,18 278,24 312,9 350,13" },
  { id: "crypto", labelKey: "market.crypto", symbol: "BTC/USD", quote: "67,420.00", move: "+1.24%", session: "Global", line: "0,82 30,51 55,72 86,35 113,60 146,25 177,45 210,17 244,38 278,10 312,30 350,4" },
] as const;

function HeroMarketCard() {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState<(typeof heroMarkets)[number]["id"]>("forex");
  const market = heroMarkets.find((item) => item.id === selectedId) ?? heroMarkets[0];

  return (
    <section aria-label={t("home.hero.cardLabel")} className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-[rgb(8_22_43/0.76)] text-white shadow-[0_28px_90px_rgb(0_0_0/0.42)] backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-5">
        <p className="flex items-center gap-2 font-mono text-[0.5625rem] font-semibold tracking-[0.18em] text-white/65 uppercase">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgb(52_211_153/0.9)]" />
          {t("home.hero.marketIntelligence")}
        </p>
        <span className="font-mono text-[0.5rem] tracking-[0.14em] text-white/45 uppercase">{t("home.hero.liveFocus")}</span>
      </header>

      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[0.5625rem] font-semibold tracking-[0.16em] text-white/45">{market.symbol}</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-[1.65rem]">{market.quote}</p>
          </div>
          <span className="mb-1 rounded-full bg-emerald-300/10 px-2.5 py-1 font-mono text-[0.625rem] font-semibold text-emerald-200">{market.move}</span>
        </div>

        <div className="relative mt-4 h-24 overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,rgb(57_190_213/0.1),rgb(20_46_75/0.06))] sm:mt-5 sm:h-32">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgb(255 255 255 / .14) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255 / .14) 1px,transparent 1px)", backgroundSize: "25% 50%" }} />
          <svg viewBox="0 0 350 92" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-label={t("home.hero.priceTrend").replace("{symbol}", market.symbol)} role="img">
            <defs><linearGradient id="hero-market-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#64dce8" stopOpacity="0.24" /><stop offset="100%" stopColor="#64dce8" stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,92 ${market.line} 350,92`} fill="url(#hero-market-fill)" />
            <polyline points={market.line} fill="none" stroke="#74e1ec" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <dl className="grid grid-cols-3 gap-2 border-b border-white/10 py-3.5 sm:py-4">
          {[[t("home.hero.session"), market.session], [t("home.hero.bias"), t("home.hero.positive")], [t("home.hero.status"), t("home.hero.open")]].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[0.5rem] font-semibold tracking-[0.16em] text-white/40 uppercase">{label}</dt>
              <dd className={`mt-1 text-[0.6875rem] font-medium ${value === "Positive" ? "text-emerald-200" : "text-white/85"}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div role="group" aria-label={t("home.hero.chooseMarket")} className="grid grid-cols-4 gap-1 px-3 py-2.5 sm:px-4 sm:py-3">
        {heroMarkets.map((item) => (
          <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-8 rounded-full px-2 text-[0.5625rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${selectedId === item.id ? "border border-white/20 bg-white/15 text-white" : "text-white/50 hover:bg-white/10 hover:text-white/85"}`}>
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <nav aria-label={t("home.hero.marketTools")} className="grid grid-cols-3 border-t border-white/10 px-2 py-2.5 sm:py-3">
        <Link href="/markets#charts" className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.5625rem] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-200"><ChartNoAxesCombined className="size-3.5 text-cyan-200" aria-hidden="true" />{t("home.hero.chartTools")}</Link>
        <Link href="/tools/calculator" className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.5625rem] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-200"><ShieldCheck className="size-3.5 text-cyan-200" aria-hidden="true" />{t("home.hero.riskTools")}</Link>
        <Link href="/education" className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.5625rem] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-200"><BookOpen className="size-3.5 text-cyan-200" aria-hidden="true" />{t("home.hero.education")}</Link>
      </nav>
    </section>
  );
}

function localizedHero(
  content: HomeHeroContent | undefined,
  locale: Locale,
  t: (key: DictionaryKey) => string,
) {
  const source = { ...heroDefaults, ...content };
  if (locale === "en") {
    return {
      ...source,
      eyebrow: "A clearer way to trade",
      title: ["Trade with a clearer view", "of what moves markets."] as const,
      lead: "Explore forex, indices, metals, energies, stocks and crypto CFDs through a transparent, technology-led trading experience.",
    };
  }
  return {
    ...source,
    eyebrow: t("home.hero.eyebrow"),
    title: [t("home.hero.titleFirst"), t("home.hero.titleSecond")] as const,
    lead: t("home.hero.lead"),
  };
}
