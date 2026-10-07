import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { InstrumentTable } from "@/components/products/instrument-table";
import { TradingConditionsSection } from "@/components/sections/trading-conditions";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments } from "@/db/queries";
import { assetClassList } from "@/lib/asset-classes";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";
import { routeCopy } from "@/lib/i18n/route-copy";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Specs & Trading Conditions",
    description: "Spread, tick size, price precision, leverage cap, margin requirement and session hours for every instrument we quote, grouped by asset class.",
    alternates: await routeAlternates("/trading/conditions"),
  };
}

export const revalidate = 300;

/** Costs a position carries beyond the spread, stated plainly. */
const charges = [
  {
    term: "Spread",
    detail:
      "The difference between bid and ask, quoted in each class's own convention: pips for FX, index points for cash indices, and the quote currency elsewhere. The figures in the tables are typical values during the most liquid session for the instrument.",
  },
  {
    term: "Commission",
    detail:
      "Zero on Standard accounts, where the cost sits in the spread. Pro and VIP accounts carry a capped per-lot commission in exchange for raw pricing, which is the cheaper arrangement above roughly ten lots a month.",
  },
  {
    term: "Swap",
    detail:
      "Connect Funded does not charge swap fees or overnight financing on any asset class, on evaluation or funded accounts.",
  },
  {
    term: "Margin",
    detail:
      "Derived directly from the leverage cap — 1:100 means 1% initial margin. Margin is locked while the position is open, and accounts are closed when they reach the 5% loss limit.",
  },
  {
    term: "Deposits & withdrawals",
    detail:
      "No fee on any method, in either direction. We absorb the processing cost on every rail, so the amount you request is the amount you receive.",
  },
  {
    term: "Inactivity",
    detail:
      "No inactivity fee. An account with a zero balance and no open positions is simply dormant, and reactivates on the next deposit.",
  },
];

export default async function ConditionsPage() {
  const [instruments, locale] = await Promise.all([getInstruments(), getServerLocale()]);
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const terms = locale === "ar"
    ? ["السبريد", "العمولة", "رسوم التبييت", "الهامش", "الإيداعات والسحوبات", "عدم النشاط"]
    : locale === "fr"
      ? ["Spread", "Commission", "Swap", "Marge", "Dépôts et retraits", "Inactivité"]
      : charges.map((charge) => charge.term);

  return (
    <>
      <Section
        data-hero-stage=""
        className="bg-deep isolate overflow-hidden pt-32 pb-12 sm:pt-40"
      >
        <GridBackdrop className="opacity-70" />
        <Container className="relative">
          <Reveal>
            <Badge tone="brand">{t("conditions.badge")}</Badge>
            <h1 className="text-h1 mt-6 max-w-3xl">
              {t("conditions.title")}
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {t("conditions.lead")}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {t("conditions.open")}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/tools/calculator" variant="soft" size="lg">
              {t("conditions.calculator")}
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <TradingConditionsSection id="overview" />

      <Section size="spacious" className="bg-bg">
        <Container>
          <SectionHeading
            eyebrow={t("conditions.contracts")}
            title={t("conditions.byClass")}
            lead={t("conditions.contractsLead")}
          />

          <div className="mt-12 space-y-14">
            {assetClassList.map((asset) => {
              const rows = instruments.filter(
                (item) => item.assetClass === asset.slug,
              );
              if (rows.length === 0) return null;

              return (
                <Reveal key={asset.slug} id={asset.slug} className="scroll-mt-28">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-ink text-xl font-semibold">
                        {translate(locale, `asset.${asset.slug}` as Parameters<typeof translate>[1])}
                      </h3>
                      <p className="text-muted mt-1.5 text-sm">
                        {translate(locale, `asset.${asset.slug}.tagline` as Parameters<typeof translate>[1])}
                      </p>
                    </div>
                    <ButtonLink
                      href={`/trade/${asset.slug}`}
                      variant="outline"
                      size="sm"
                    >
                      {t("conditions.marketDetail")}
                      <ArrowRight />
                    </ButtonLink>
                  </div>
                  <div className="mt-5">
                    <InstrumentTable
                      assetClass={asset.slug}
                      instruments={rows}
                      caption={locale === "ar" ? `مواصفات عقود ${translate(locale, `asset.${asset.slug}` as Parameters<typeof translate>[1])}` : locale === "fr" ? `Spécifications des contrats ${translate(locale, `asset.${asset.slug}` as Parameters<typeof translate>[1])}` : `${asset.label} contract specifications`}
                      locale={locale}
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section size="spacious" className="bg-sunken">
        <Container>
          <SectionHeading
            eyebrow={t("conditions.fees")}
            title={t("conditions.holdingCosts")}
            lead={t("conditions.feesLead")}
          />

          <Reveal className="mt-12">
            <dl className="border-line-soft rounded-2xl border p-1">
              {charges.map((charge, index) => (
                <div
                  key={charge.term}
                  className="border-line-soft hover:bg-raised/60 grid gap-2 border-b px-5 py-5 transition-colors last:border-b-0 sm:grid-cols-[minmax(0,0.28fr)_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="font-display text-ink text-base font-semibold">
                    {terms[index]}
                  </dt>
                  <dd className="text-muted text-sm leading-relaxed">
                    {t(`conditions.${["spread", "commission", "swap", "margin", "deposits", "inactivity"][index]}` as Parameters<typeof routeCopy>[1])}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
