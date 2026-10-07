import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowUpRight, BookOpenCheck, CandlestickChart, ChartNoAxesCombined, Compass, ShieldCheck, Sparkles, Target } from "lucide-react";

import { TradingEdgeHero } from "@/components/trading-edge/edge-hero";
import { Container, Section } from "@/components/ui/container";
import { routeAlternates } from "@/lib/i18n/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { getTradingEdgeCopy } from "@/lib/i18n/trading-edge";
import { loadQuotes } from "@/lib/quotes.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Trading Hub", description: "Trading education, market context, risk planning and private performance tools.", alternates: await routeAlternates("/trading-edge") };
}

const icons = [CandlestickChart, Activity, ChartNoAxesCombined, Target, ShieldCheck, Compass, BookOpenCheck, Sparkles];
const keys = ["strategies", "technical", "insights", "signals", "risk", "management", "journal", "performance"] as const;

export default async function TradingEdgePage() {
  const locale = await getServerLocale();
  const copy = getTradingEdgeCopy(locale);
  const { quotes, source } = await loadQuotes({ symbols: ["XAU/USD", "EUR/USD", "BTC/USD", "NAS100"] });
  const price = new Intl.NumberFormat(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 4 });

  return <>
    <TradingEdgeHero eyebrow={copy.brand} title={copy.hubTitle} lead={copy.hubLead}>
      <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white/80"><span className="size-2 rounded-full bg-accent" />{source === "live" ? copy.sourceLive : copy.sourceIndicative}</p>
    </TradingEdgeHero>
    <Section className="bg-bg pt-12 sm:pt-16">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {keys.map((key, index) => {
            const item = copy.menuItems[index];
            const Icon = icons[index];
            return <Link key={key} href={item.href} className="cf-interactive-card group flex min-h-52 flex-col rounded-2xl border border-line-soft bg-panel p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-light/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light sm:p-6">
              <span className="grid size-11 place-items-center rounded-xl border border-brand/20 bg-brand/10 text-brand-light transition-transform duration-300 group-hover:scale-105"><Icon className="size-5" aria-hidden="true" /></span>
              <h2 className="font-display mt-5 text-lg font-semibold text-ink">{item.label}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{copy.pages[key].lead}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-light">{copy.open}<ArrowUpRight className="size-4" aria-hidden="true" /></span>
            </Link>;
          })}
        </div>
      </Container>
    </Section>
    <Section className="border-y border-line-soft bg-raised py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{copy.labels.marketStatus}</p><h2 className="text-h2 mt-3 text-ink">{copy.pages.insights.outlook}</h2></div><Link href="/markets" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 font-semibold text-brand-light hover:bg-brand-dim/30 focus-visible:outline-2">{copy.learnMore}<ArrowUpRight className="size-4" /></Link></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{quotes.map((quote) => <div key={quote.symbol} className="rounded-2xl border border-line-soft bg-panel p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-ink">{quote.symbol}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${quote.changePct >= 0 ? "bg-accent/10 text-accent" : "bg-loss/10 text-loss"}`}>{quote.changePct >= 0 ? "+" : ""}{quote.changePct.toFixed(2)}%</span></div><p className="mt-3 font-mono text-xl tabular-nums text-ink">{price.format(quote.price)}</p><p className="mt-2 text-xs text-muted">{source === "live" ? copy.sourceLive : copy.sourceIndicative}</p></div>)}</div>
        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-muted">{copy.disclaimer}</p>
      </Container>
    </Section>
  </>;
}
