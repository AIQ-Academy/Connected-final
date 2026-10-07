import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, ChevronDown, CircleHelp, Gauge, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { TradingEdgeHero } from "@/components/trading-edge/edge-hero";
import { AssetFilter, JournalWorkspace, MarketInsightGrid, RiskCalculator } from "@/components/trading-edge/widgets";
import { ChartWorkbench, type ChartSymbol } from "@/components/market/chart-workbench";
import { Container, Section } from "@/components/ui/container";
import { getInstruments } from "@/db/queries";
import { getServerLocale } from "@/lib/i18n/server";
import { getTradingEdgeCopy, type TradingEdgeSection } from "@/lib/i18n/trading-edge";
import { loadQuotes } from "@/lib/quotes.server";

const sections = ["strategies", "technical-analysis", "market-insights", "signals", "risk-management", "trade-management", "journal", "performance"] as const;
type RouteSection = (typeof sections)[number];
const pageKey: Record<RouteSection, TradingEdgeSection> = {
  strategies: "strategies", "technical-analysis": "technical", "market-insights": "insights", signals: "signals",
  "risk-management": "risk", "trade-management": "management", journal: "journal", performance: "performance",
};
const slugs = ["scalping", "day-trading", "swing-trading", "trend-following", "breakout-trading", "price-action", "momentum-trading", "support-resistance"];

export async function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  if (!sections.includes(section as RouteSection)) return { title: "Trading Hub" };
  const locale = await getServerLocale();
  return { title: getTradingEdgeCopy(locale).pages[pageKey[section as RouteSection]].title };
}

export default async function TradingEdgeSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: rawSection } = await params;
  if (!sections.includes(rawSection as RouteSection)) notFound();
  const section = rawSection as RouteSection;
  const key = pageKey[section];
  const locale = await getServerLocale();
  const copy = getTradingEdgeCopy(locale);
  const page = copy.pages[key];

  return <>
    <TradingEdgeHero eyebrow={copy.brand} title={page.title} lead={page.lead}>
      {section === "market-insights" && <MarketSource locale={locale} />}
      {section === "risk-management" && <p className="mt-5 text-sm text-white/70">{copy.disclaimer}</p>}
    </TradingEdgeHero>
    {section === "strategies" && <StrategiesPage copy={copy} />}
    {section === "technical-analysis" && <TechnicalPage copy={copy} />}
    {section === "market-insights" && <InsightsPage copy={copy} locale={locale} />}
    {section === "signals" && <SignalsPage copy={copy} />}
    {section === "risk-management" && <RiskPage copy={copy} />}
    {section === "trade-management" && <ManagementPage copy={copy} />}
    {section === "journal" && <DataPage copy={copy} locale={locale} mode="journal" />}
    {section === "performance" && <DataPage copy={copy} locale={locale} mode="performance" />}
    <Section className="border-t border-line-soft bg-raised py-10"><Container className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-3xl text-xs leading-relaxed text-muted">{copy.disclaimer}</p><Link href="/trading-edge" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-brand-light hover:bg-brand-dim/30 focus-visible:outline-2">{copy.brand}<ArrowRight className="size-4" /></Link></Container></Section>
  </>;
}

function StrategiesPage({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const page = copy.pages.strategies;
  const details = strategyMeta(copy);
  return <Section className="bg-bg"><Container><div><p className="eyebrow">{page.head}</p><h2 className="text-h2 mt-3 text-ink">{page.head}</h2><p className="text-muted mt-3 max-w-3xl">{page.lead2}</p></div>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{page.groups.map((name, index) => <article key={name} className="cf-interactive-card rounded-2xl border border-line-soft bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-light/50 hover:shadow-lg"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-light"><BookOpen className="size-5" /></span><span className="rounded-full border border-line-soft px-2.5 py-1 text-[11px] text-muted">{details.difficulty[index]}</span></div><h3 className="font-display mt-4 text-lg font-semibold text-ink">{name}</h3><p className="mt-2 min-h-16 text-sm leading-relaxed text-muted">{page.descriptions[index]}</p><dl className="mt-4 space-y-2 border-t border-line-soft pt-4 text-xs"><div className="flex justify-between gap-3"><dt className="text-muted">{copy.labels.timeframe}</dt><dd className="font-medium text-ink">{details.timeframe[index]}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">{copy.labels.market}</dt><dd className="font-medium text-ink">{details.market[index]}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">{copy.labels.risk}</dt><dd className="font-medium text-ink">{details.risk[index]}</dd></div></dl><Link href={`/trading-edge/strategies/${slugs[index]}`} className="mt-5 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand-light focus-visible:outline-2">{copy.open}<ArrowUpRight className="size-4" /></Link></article>)}</div>
  </Container></Section>;
}

function strategyMeta(copy: ReturnType<typeof getTradingEdgeCopy>) {
  if (copy.pages.strategies.groups[0] === "Scalping") return {
    difficulty: ["Advanced", "Intermediate", "Intermediate", "Intermediate", "Advanced", "Intermediate", "Advanced", "Beginner"], timeframe: ["1–5 min", "5 min–1 h", "4 h–Daily", "1 h–Daily", "15 min–4 h", "Any", "5 min–1 h", "Any"], market: ["FX · metals", "FX · indices", "Multi-asset", "Multi-asset", "Multi-asset", "Multi-asset", "FX · indices", "Multi-asset"], risk: ["Very high", "High", "Moderate", "Moderate", "High", "Moderate", "High", "Moderate"],
  };
  if (copy.pages.strategies.groups[0] === "المضاربة السريعة") return {
    difficulty: ["متقدمة", "متوسطة", "متوسطة", "متوسطة", "متقدمة", "متوسطة", "متقدمة", "مبتدئة"], timeframe: ["١–٥ دقائق", "٥ دقائق–ساعة", "٤ ساعات–يومي", "ساعة–يومي", "١٥ دقيقة–٤ ساعات", "مختلف", "٥ دقائق–ساعة", "مختلف"], market: ["فوركس · معادن", "فوركس · مؤشرات", "متعدد الأصول", "متعدد الأصول", "متعدد الأصول", "متعدد الأصول", "فوركس · مؤشرات", "متعدد الأصول"], risk: ["مرتفعة جدًا", "مرتفعة", "متوسطة", "متوسطة", "مرتفعة", "متوسطة", "مرتفعة", "متوسطة"],
  };
  return { difficulty: ["Avancée", "Intermédiaire", "Intermédiaire", "Intermédiaire", "Avancée", "Intermédiaire", "Avancée", "Débutant"], timeframe: ["1–5 min", "5 min–1 h", "4 h–Journalier", "1 h–Journalier", "15 min–4 h", "Variable", "5 min–1 h", "Variable"], market: ["FX · métaux", "FX · indices", "Multi-actifs", "Multi-actifs", "Multi-actifs", "Multi-actifs", "FX · indices", "Multi-actifs"], risk: ["Très élevé", "Élevé", "Modéré", "Modéré", "Élevé", "Modéré", "Élevé", "Modéré"] };
}

async function TechnicalPage({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const page = copy.pages.technical;
  const [market, instruments] = await Promise.all([loadQuotes({ symbols: ["XAU/USD", "EUR/USD", "BTC/USD"] }), getInstruments()]);
  const instrumentMap = new Map(instruments.map((instrument) => [instrument.symbol, instrument]));
  const chartSymbols: ChartSymbol[] = ["XAU/USD", "EUR/USD", "BTC/USD"].flatMap((symbol) => {
    const instrument = instrumentMap.get(symbol);
    return instrument ? [{ label: symbol, tvSymbol: instrument.tvSymbol }] : [];
  });
  return <Section className="bg-bg"><Container>
    <div className="grid gap-4 lg:grid-cols-3">{page.groups.map((group, groupIndex) => <article key={group} className="rounded-2xl border border-line-soft bg-panel p-5 sm:p-6"><h2 className="font-display text-lg font-semibold text-ink">{group}</h2><ul className="mt-4 space-y-2">{page.items[groupIndex].map((item) => <li key={item} className="flex items-center gap-3 rounded-xl bg-sunken/45 px-3 py-2.5 text-sm text-ink"><span className="size-1.5 rounded-full bg-brand-light" />{item}</li>)}</ul></article>)}</div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><section className="rounded-3xl border border-line-soft bg-panel p-3 sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2"><h2 className="font-display text-lg font-semibold text-ink">{page.chart}</h2><span className="rounded-full border border-line-soft px-3 py-1 text-xs text-muted">{market.source === "live" ? copy.sourceLive : copy.sourceIndicative}</span></div><ChartWorkbench symbols={chartSymbols} initialQuotes={market.quotes} height={480} copy={copy.chartUi} /></section><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{[copy.labels.structure, copy.labels.trendStrength, copy.labels.support, copy.labels.resistance].map((label) => <div key={label} className="rounded-2xl border border-line-soft bg-panel p-5"><p className="text-xs text-muted">{label}</p><p className="mt-3 flex items-center gap-2 font-semibold text-ink"><CircleHelp className="size-4 text-muted" />{copy.labels.noData}</p></div>)}</div></div>
  </Container></Section>;
}

async function MarketSource({ locale }: { locale: "en" | "fr" | "ar" }) {
  const { source } = await loadQuotes({ symbols: ["XAU/USD"] });
  const copy = getTradingEdgeCopy(locale);
  return <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white/80"><span className="size-2 rounded-full bg-accent" />{source === "live" ? copy.sourceLive : copy.sourceIndicative}</p>;
}

async function InsightsPage({ copy, locale }: { copy: ReturnType<typeof getTradingEdgeCopy>; locale: "en" | "fr" | "ar" }) {
  const { quotes, source } = await loadQuotes({ symbols: ["XAU/USD", "EUR/USD", "BTC/USD", "XAG/USD", "NAS100", "WTI"] });
  return <Section className="bg-bg"><Container>
    <MarketInsightGrid quotes={quotes} categories={copy.pages.insights.categories} locale={locale} labels={copy.labels} allLabel={copy.filters[0]} sourceLabel={source === "live" ? copy.sourceLive : copy.sourceIndicative} />
    <article className="mt-8 rounded-3xl border border-brand/20 bg-brand/5 p-6 sm:p-8"><p className="eyebrow">{copy.pages.insights.outlook}</p><h2 className="text-h2 mt-3 text-ink">{copy.pages.insights.outlookTitle}</h2><p className="mt-3 max-w-3xl text-muted">{copy.pages.insights.outlookBody}</p><p className="mt-4 text-xs text-muted">{copy.disclaimer}</p></article>
  </Container></Section>;
}

function SignalsPage({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  return <Section className="bg-bg"><Container>
    <section className="rounded-3xl border border-line-soft bg-panel p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">{copy.pages.signals.filtersTitle}</p><h2 className="font-display mt-2 text-xl font-semibold text-ink">{copy.pages.signals.history}</h2></div><span className="rounded-full border border-line-soft px-3 py-1.5 text-xs text-muted">{copy.labels.noData}</span></div><div className="mt-5"><AssetFilter filters={copy.filters} /></div><div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-line-soft px-6 py-14 text-center"><span className="grid size-12 place-items-center rounded-full bg-sunken text-muted"><Gauge className="size-6" /></span><h3 className="mt-4 font-semibold text-ink">{copy.signalEmpty}</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{copy.signalNote}</p></div></section>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{copy.pages.signals.stats.map((stat) => <div key={stat} className="rounded-2xl border border-line-soft bg-panel p-5"><p className="text-xs text-muted">{stat}</p><p className="mt-3 font-mono text-2xl font-semibold text-ink">—</p></div>)}</div><p className="mt-5 text-xs leading-relaxed text-muted">{copy.pages.signals.disclaimer}</p>
  </Container></Section>;
}

function RiskPage({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const values = ["1%", "10%", "1 : 2", "2%"];
  return <Section className="bg-bg"><Container>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{copy.pages.risk.metrics.map((metric, index) => <article key={metric} className="rounded-2xl border border-line-soft bg-panel p-5"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-light">{index === 0 ? <ShieldCheck className="size-5" /> : <Gauge className="size-5" />}</span><p className="mt-4 text-sm text-muted">{metric}</p><p className="mt-2 font-mono text-2xl font-semibold text-ink">{values[index]}</p><p className="mt-2 text-xs text-muted">{copy.labels.educational}</p></article>)}</div>
    <div className="mt-10"><h2 className="text-h2 mb-5 text-ink">{copy.labels.positionSize}</h2><RiskCalculator copy={copy} /></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{copy.pages.risk.topics.map((topic) => <details key={topic} className="group rounded-xl border border-line-soft bg-panel p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink"><span>{topic}</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-relaxed text-muted">{copy.disclaimer}</p></details>)}</div>
  </Container></Section>;
}

function ManagementPage({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const page = copy.pages.management;
  const topics = page.topics;
  return <Section className="bg-bg"><Container>
    <div className="rounded-3xl border border-line-soft bg-panel p-5 sm:p-8"><p className="eyebrow">{page.example}</p><ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{page.steps.map((step, index) => <li key={step} className="relative rounded-2xl border border-line-soft bg-bg p-4 text-center"><span className="mx-auto grid size-9 place-items-center rounded-full bg-brand/10 font-mono text-sm font-semibold text-brand-light">0{index + 1}</span><p className="mt-3 font-semibold text-ink">{step}</p>{index < page.steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -end-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-brand-light lg:block" />}</li>)}</ol><TradeManagementDiagram copy={copy} /></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{topics.map((topic, index) => <article key={topic} className="rounded-2xl border border-line-soft bg-panel p-5"><span className="font-mono text-xs text-brand-light">0{index + 1}</span><h2 className="font-display mt-3 text-lg font-semibold text-ink">{topic}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{copy.disclaimer}</p></article>)}</div>
  </Container></Section>;
}

function TradeManagementDiagram({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const labels = copy.labels;
  return <div className="mt-8 overflow-x-auto rounded-2xl bg-[#101c32] p-5 text-white"><p className="text-xs text-white/60">{labels.educational}</p><div className="mt-5 flex min-w-[620px] items-center justify-between gap-3">{[labels.entry, "+1R", labels.stop, "+2R", labels.target, labels.exit].map((step, index) => <div key={`${step}-${index}`} className="flex items-center gap-2"><span className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold">{step}</span>{index < 5 && <span className="text-brand-light">→</span>}</div>)}</div><p className="mt-4 text-xs text-white/60">{copy.disclaimer}</p></div>;
}

function DataPage({ copy, locale, mode }: { copy: ReturnType<typeof getTradingEdgeCopy>; locale: "en" | "fr" | "ar"; mode: "journal" | "performance" }) {
  return <Section className="bg-bg"><Container><JournalWorkspace copy={copy} locale={locale} mode={mode} /></Container></Section>;
}
