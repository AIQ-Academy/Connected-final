import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TradingEdgeHero } from "@/components/trading-edge/edge-hero";
import { Container, Section } from "@/components/ui/container";
import { getServerLocale } from "@/lib/i18n/server";
import { getTradingEdgeCopy } from "@/lib/i18n/trading-edge";

const slugs = ["scalping", "day-trading", "swing-trading", "trend-following", "breakout-trading", "price-action", "momentum-trading", "support-resistance"];

export async function generateStaticParams() { return slugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const index = slugs.indexOf(slug);
  if (index < 0) return { title: "Trading Hub" };
  const locale = await getServerLocale();
  return { title: getTradingEdgeCopy(locale).pages.strategies.groups[index] };
}

export default async function StrategyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = slugs.indexOf(slug);
  if (index < 0) notFound();
  const locale = await getServerLocale();
  const copy = getTradingEdgeCopy(locale);
  const page = copy.pages.strategies;
  const labels = copy.labels;
  const title = page.groups[index];
  const guidance = copy.strategyGuidance;
  const details = [
    [labels.overview, page.descriptions[index]],
    [labels.conditions, guidance[0]],
    [labels.entry, guidance[1]],
    [labels.stop, guidance[2]],
    [labels.target, guidance[3]],
    [labels.rr, guidance[3]],
    [labels.mistakes, guidance[4]],
    [labels.avoid, guidance[5]],
  ];
  return <>
    <TradingEdgeHero eyebrow={`${copy.brand} · ${page.head}`} title={title} lead={page.descriptions[index]} />
    <Section className="bg-bg"><Container>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{details.map(([heading, body]) => <article key={heading} className="rounded-2xl border border-line-soft bg-panel p-5"><h2 className="font-display text-base font-semibold text-ink">{heading}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{body}</p></article>)}</div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.65fr]"><TradeDiagram copy={copy} /><aside className="flex flex-col justify-center rounded-3xl border border-brand/20 bg-brand/5 p-6"><p className="eyebrow">{labels.educational}</p><p className="mt-3 text-sm leading-relaxed text-muted">{copy.disclaimer}</p><Link href="/trading-edge/risk-management" className="mt-5 inline-flex min-h-11 w-fit items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2">{copy.menuItems[4].label}</Link></aside></div>
      <div className="mt-8"><Link href="/trading-edge/strategies" className="text-sm font-semibold text-brand-light underline-offset-4 hover:underline">← {page.head}</Link></div>
    </Container></Section>
  </>;
}

function TradeDiagram({ copy }: { copy: ReturnType<typeof getTradingEdgeCopy> }) {
  const labels = copy.labels;
  return <section className="rounded-3xl border border-line-soft bg-[#101c32] p-5 text-white sm:p-7"><p className="eyebrow text-white/70">{labels.example}</p><svg viewBox="0 0 640 260" role="img" aria-label={`${labels.entry} / ${labels.stop} / ${labels.target}`} className="mt-4 h-60 w-full"><path d="M40 50H600M40 130H600M40 210H600" stroke="rgb(255 255 255 / .16)" strokeDasharray="4 6" /><path d="M55 185 115 170 172 192 226 144 280 157 335 118 386 131 439 89 494 105 555 60" fill="none" stroke="#9dbbff" strokeWidth="3" strokeLinecap="round" /><path d="M400 40V210" stroke="#dce8ff" strokeDasharray="5 5" /><circle cx="400" cy="116" r="7" fill="#9dbbff" /><circle cx="400" cy="63" r="6" fill="#72d9a8" /><circle cx="400" cy="185" r="6" fill="#ff5d75" /><text x="416" y="68" fill="#dce8ff" fontSize="12">{labels.target}</text><text x="416" y="120" fill="#dce8ff" fontSize="12">{labels.entry}</text><text x="416" y="190" fill="#dce8ff" fontSize="12">{labels.stop}</text></svg><p className="text-xs leading-relaxed text-white/60">{copy.disclaimer}</p></section>;
}
