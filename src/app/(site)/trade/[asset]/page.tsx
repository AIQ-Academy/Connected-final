import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, Gauge, Layers, TrendingUp } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { InstrumentTable } from "@/components/products/instrument-table";
import { AssetClassGrid } from "@/components/sections/asset-class-grid";
import { OpenAccountSteps } from "@/components/sections/open-account-steps";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments } from "@/db/queries";
import {
  assetClassContent,
  assetClassOrder,
  instrumentsForClass,
  isAssetClass,
} from "@/lib/asset-classes";
import { ASSET_CLASSES } from "@/lib/market";
import { signupUrl } from "@/lib/site";
import { routeAlternates } from "@/lib/i18n/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";
import { localizedAssetClass } from "@/lib/asset-class-locales";

export const revalidate = 300;

/** Every asset class is known at build time, so all six pages are static. */
export function generateStaticParams() {
  return ASSET_CLASSES.map((asset) => ({ asset }));
}

type PageProps = { params: Promise<{ asset: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { asset } = await params;
  if (!isAssetClass(asset)) return {};
  const content = assetClassContent[asset];

  return {
    title: `Trade ${content.label}`,
    description: content.lead,
    alternates: await routeAlternates(`/trade/${asset}`),
  };
}

export default async function AssetClassPage({ params }: PageProps) {
  const { asset } = await params;
  if (!isAssetClass(asset)) notFound();
  const locale = await getServerLocale();
  const source = localizedAssetClass(locale, asset);
  const label = translate(locale, `asset.${asset}` as Parameters<typeof translate>[1]);
  const content = { ...source, label };
  const text = locale === "ar" ? {
    trade: "تداول", withPricing: "بتسعير يمكنك التحقق منه.", start: "ابدأ التداول", specs: "عرض المواصفات", instruments: "الأدوات", spread: "السبريد ابتداءً من", session: "الجلسة", leverage: "أقصى رافعة مالية", why: `لماذا ${label}`, drivers: "محركات السوق", moves: `ما الذي يحرك ${label} فعليًا؟`, driversLead: "تفسر أربعة عوامل معظم التغيرات. وما عداها ضجيج حولها.", specsTitle: `كل أدوات ${label} التي نسعّرها`, specsLead: "قيم السبريد المعتادة لحساب Pro خلال أكثر الجلسات سيولة. يُحسب الهامش مباشرةً من حد الرافعة المالية.", fullSpecs: "ورقة المواصفات الكاملة", beforeTicket: "قبل فتح الصفقة", size: `حدد حجم مركز ${label}`, calcLead: "تفتح الحاسبة على هذا السوق. غيّر الأداة وحجم اللوت ووقف الخسارة لمعرفة الهامش وقيمة النقطة والخسارة عند الوقف.", also: "متاح أيضًا في حسابك", tradeNext: "تداول" 
  } : locale === "fr" ? {
    trade: "Trader", withPricing: "avec un prix vérifiable.", start: "Commencer à trader", specs: "Voir les spécifications", instruments: "Instruments", spread: "Spread à partir de", session: "Séance", leverage: "Levier maximal", why: `Pourquoi le ${label.toLowerCase()}`, drivers: "Facteurs du marché", moves: `Qu’est-ce qui fait réellement bouger le ${label.toLowerCase()} ?`, driversLead: "Quatre facteurs expliquent l’essentiel des variations. Le reste n’est que du bruit.", specsTitle: `Chaque instrument ${label.toLowerCase()} que nous cotons`, specsLead: "Spreads indicatifs d’un compte Pro pendant la séance la plus liquide. La marge découle directement du plafond de levier.", fullSpecs: "Toutes les spécifications", beforeTicket: "Avant l’ordre", size: `Dimensionner une position ${label.toLowerCase()}`, calcLead: "La calculatrice s’ouvre sur ce marché. Modifiez l’instrument, le lot et le stop pour voir la marge, la valeur du pip et la perte au stop.", also: "Également sur votre compte", tradeNext: "Trader" 
  } : {
    trade: "Trade", withPricing: "with pricing you can audit.", start: "Start trading", specs: "See specifications", instruments: "Instruments", spread: "Spread from", session: "Session", leverage: "Max leverage", why: `Why ${label.toLowerCase()}`, drivers: "Market drivers", moves: `What actually moves ${label.toLowerCase()}`, driversLead: "Four forces explain most of the variance. Everything else is noise around them.", specsTitle: `Every ${label.toLowerCase()} instrument we quote`, specsLead: "Spreads are typical values on a Pro account during the most liquid session for the instrument. Margin is derived directly from the leverage cap.", fullSpecs: "Full spec sheet", beforeTicket: "Before the ticket", size: `Size a ${label.toLowerCase()} position`, calcLead: "The calculator opens on this market. Change the instrument, lot size and stop to see margin, pip value and the exact loss at your stop.", also: "Also on your account", tradeNext: "Trade" 
  };
  const all = await getInstruments();
  const instruments = all.filter((item) => item.assetClass === asset);
  const seeded = instrumentsForClass(asset);

  // The next class in the ring, used for the "also trade" hand-off.
  const index = assetClassOrder.indexOf(asset);
  const next = assetClassContent[assetClassOrder[(index + 1) % assetClassOrder.length]];

  const tightest = seeded.reduce(
    (min, item) => Math.min(min, item.baseSpread),
    Number.POSITIVE_INFINITY,
  );

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <Section
        data-hero-stage=""
        className="bg-deep isolate overflow-hidden pt-32 sm:pt-40"
      >
        <GridBackdrop className="opacity-70" />

        <Container className="relative">
          <Reveal>
            <Badge tone="brand">{content.label}</Badge>
            <h1 className="text-h1 mt-6 max-w-4xl">
              {text.trade} {content.label.toLowerCase()} {text.withPricing}
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {content.lead}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {text.start} {content.label.toLowerCase()}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#instruments" variant="soft" size="lg">
              {text.specs}
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="border-line bg-line mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border lg:grid-cols-4">
              {[
                {
                  icon: Layers,
                  label: text.instruments,
                  value: String(seeded.length),
                },
                {
                  icon: Gauge,
                  label: text.spread,
                  value: Number.isFinite(tightest) ? tightest.toString() : "—",
                },
                { icon: Clock, label: text.session, value: content.hours },
                {
                  icon: TrendingUp,
                  label: text.leverage,
                  value: content.leverage,
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-panel px-5 py-7 sm:px-7">
                  <dt className="text-faint flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    <stat.icon className="size-3.5" />
                    {stat.label}
                  </dt>
                  <dd className="font-display readout text-ink mt-3 text-3xl font-semibold">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </Section>


      {/* ---------------- Why this class ---------------- */}
      <Section size="spacious" className="bg-bg">
        <Container>
          <SectionHeading
            eyebrow={text.why}
            title={content.tagline}
          />

          <StaggerGroup className="mt-12 grid gap-4 lg:grid-cols-3">
            {content.highlights.map((highlight) => (
              <StaggerItem key={highlight.title}>
                <article className="tile tile-sheen group h-full overflow-hidden p-6 sm:p-7">
                  <Check className="text-mint size-5" />
                  <h3 className="font-display text-ink mt-4 text-lg font-semibold">
                    {highlight.title}
                  </h3>
                  <p className="text-muted mt-2.5 text-sm leading-relaxed">
                    {highlight.body}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* ---------------- What moves it ---------------- */}
      <Section size="spacious" className="bg-sunken isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_0%,rgb(var(--cf-brand-glow)/0.15),transparent_60%)]"
        />
        <Container className="relative grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeading
              eyebrow={text.drivers}
              title={text.moves}
              lead={text.driversLead}
            />
          </div>

          <Reveal delay={0.06}>
            <ol className="border-line-soft space-y-px rounded-2xl border p-1">
              {content.drivers.map((driver, i) => (
                <li
                  key={driver}
                  className="border-line-soft hover:bg-raised/60 flex gap-4 border-b px-5 py-4 transition-colors last:border-b-0"
                >
                  <span className="readout text-brand-light shrink-0 text-sm font-semibold">
                    0{i + 1}
                  </span>
                  <span className="text-muted text-sm leading-relaxed">
                    {driver}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- Specifications ---------------- */}
      <Section id="instruments" size="spacious" className="bg-bg scroll-mt-28">
        <Container>
          <SectionHeading
            eyebrow={text.specs}
            title={text.specsTitle}
            lead={text.specsLead}
            action={
              <ButtonLink href="/trading/conditions" variant="soft" size="lg">
                {text.fullSpecs}
                <ArrowRight />
              </ButtonLink>
            }
          />

          <Reveal className="mt-12">
            <InstrumentTable
              assetClass={asset}
              instruments={instruments}
              caption={`${content.label} contract specifications`}
              locale={locale}
            />
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- Calculator, pre-loaded ---------------- */}
      <Section size="spacious" className="bg-sunken">
        <Container>
          <SectionHeading
              eyebrow={text.beforeTicket}
              title={text.size}
              lead={text.calcLead}
          />
          <Reveal className="mt-12">
            <PositionCalculator defaultSymbol={seeded[0]?.symbol} />
          </Reveal>
        </Container>
      </Section>

      <OpenAccountSteps />

      {/* ---------------- Hand-off ---------------- */}
      <Section className="bg-bg">
        <Container>
          <Reveal className="surface flex flex-wrap items-center justify-between gap-6 p-6 sm:p-9">
            <div>
              <p className="eyebrow">{text.also}</p>
              <p className="font-display text-ink mt-2 text-xl font-semibold">
                {next.label} — {next.tagline}
              </p>
            </div>
            <ButtonLink href={`/trade/${next.slug}`} variant="soft" size="lg">
              {text.tradeNext} {translate(locale, `asset.${next.slug}` as Parameters<typeof translate>[1])}
              <ArrowRight />
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <AssetClassGrid id="all-markets" heading={false} />
    </>
  );
}
