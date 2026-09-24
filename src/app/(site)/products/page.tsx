import type { Metadata } from "next";
import {
  ArrowRight,
  Gauge,
  Layers,
  Server,
  ShieldCheck,
  Timer,
} from "lucide-react";

import { BuySellSteps } from "@/components/products/buy-sell-steps";
import { ProductsExplorer } from "@/components/products/products-explorer";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments } from "@/db/queries";
import { standardLeverageSummary } from "@/lib/leverage";
import { ASSET_CLASSES } from "@/lib/market";
import { riskDisclosure, signupUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products & Instruments",
  description:
    "Standard account leverage by asset class, full contract specifications, and a clear Buy / Sell walkthrough — plus how execution and overnight financing work.",
};

const executionPoints = [
  {
    icon: Server,
    title: "Tier-1 liquidity, aggregated",
    body: "Pricing is aggregated from a panel of tier-1 banks and non-bank market makers. The best available bid and offer is what reaches your terminal, on a Standard account and a VIP account alike.",
  },
  {
    icon: ShieldCheck,
    title: "No dealing-desk intervention",
    body: "There is no manual desk sitting between your order and the aggregated book. Nobody reprices a fill after the fact, and there is no plug that widens quotes for a profitable account.",
  },
  {
    icon: Timer,
    title: "No widening mandate around news",
    body: "Spreads move when the underlying book moves and not because a release is on the calendar. We do not apply a scheduled-news markup, do not raise margin ahead of an event, and do not close positions into one.",
  },
  {
    icon: Gauge,
    title: "Symmetric slippage",
    body: "In a fast market you may fill away from your requested price. When that movement is in your favour it is passed through to you in full, exactly as it is when it is against you.",
  },
] as const;

const financingPoints = [
  {
    title: "How the charge is derived",
    body: "Overnight financing on a currency pair reflects the interest-rate differential between the two currencies, adjusted for the cost of carrying the position through the bank market. On indices, commodities and share CFDs it is the relevant benchmark rate plus or minus a spread applied to the notional value of the position.",
  },
  {
    title: "When it is applied",
    body: "Rollover runs at 21:00 UTC. A position open at that moment is charged or credited for one day; a position closed before it is not charged at all, no matter how long it was open during the session.",
  },
  {
    title: "The triple-swap days",
    body: "Forex and metals are charged three days of financing on Wednesday to cover the weekend value date. Indices, energy and share CFDs are charged triple on Friday. Crypto is charged a single day every day, weekends included.",
  },
  {
    title: "Where to check it",
    body: "The live rate for every instrument is published in the platform contract specification and in the client portal, and it is the same rate on every live trading account.",
  },
] as const;

export default async function ProductsPage() {
  const instruments = await getInstruments();

  const grouped = ASSET_CLASSES.map((assetClass) => ({
    assetClass,
    items: instruments.filter(
      (instrument) => instrument.assetClass === assetClass,
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHero />

      <Section id="leverage" className="pt-16 sm:pt-20 lg:pt-24">
        <Container>
          <Reveal>
            <LeverageTable />
          </Reveal>
        </Container>
      </Section>

      <Section
        id="how-to-trade"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <BuySellSteps />
        </Container>
      </Section>

      <ProductsExplorer groups={grouped} />

      <Section
        id="execution"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="Execution quality"
            title="The fill is the product."
            lead="A tight advertised spread means nothing if the fill arrives somewhere else. These four commitments are what actually determine what a strategy earns."
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {executionPoints.map((point) => (
              <StaggerItem
                key={point.title}
                className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
              >
                <point.icon
                  className="text-brand-light size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {point.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {point.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.1}>
            <div className="border-line-soft bg-panel mt-6 grid gap-8 rounded-2xl border p-6 sm:grid-cols-3 sm:p-8">
              <div>
                <p className="text-ink font-display text-2xl font-semibold">
                  Market execution
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Every order fills at the best available price in the
                  aggregated book. There are no requotes, because there is
                  nothing to requote against.
                </p>
              </div>
              <div>
                <p className="text-ink font-display text-2xl font-semibold">
                  No stop distance
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Stops and limits can be placed at any distance from the
                  current price, including inside the spread. Nothing is
                  rejected for being too close.
                </p>
              </div>
              <div>
                <p className="text-ink font-display text-2xl font-semibold">
                  Partial fills honoured
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Large orders fill across price levels rather than waiting for
                  a single venue to show the full size, which is what depth of
                  market on cTrader is showing you.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="financing">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <SectionHeading
              eyebrow="Swap and financing"
              title="Overnight costs, stated plainly."
              lead="Holding a position past the daily rollover incurs a financing charge or credit. It is a genuine cost of carry, not a hidden fee, and it is the same on every live trading account."
            />

            <Reveal delay={0.06}>
              <dl className="border-line-soft divide-line-soft divide-y rounded-2xl border">
                {financingPoints.map((point) => (
                  <div key={point.title} className="p-6 sm:p-7">
                    <dt className="text-ink font-display text-base font-semibold">
                      {point.title}
                    </dt>
                    <dd className="text-muted mt-2 text-sm leading-relaxed">
                      {point.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="border-line-soft bg-sunken/50 mt-10 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <Layers
                  className="text-brand-light mt-1 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-ink text-[0.9375rem] font-semibold">
                    Swap-sensitive strategies
                  </p>
                  <p className="text-muted mt-1.5 max-w-2xl text-sm leading-relaxed">
                    Carry trades and long-dated positions are permitted without
                    restriction. If financing is central to your edge, check the
                    current rate in the contract specification before you size
                    the position — rates move with the underlying benchmarks.
                  </p>
                </div>
              </div>
              <ButtonLink href="/contact" variant="soft" className="shrink-0">
                Ask about a specific rate
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      <ConversionBand />
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-12 sm:pt-20">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative">
        <Reveal direction="none">
          <span className="eyebrow">
            <span className="chev" />
            02 / Products
          </span>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="text-h1 mt-5 max-w-3xl">
            Account types, leverage, and Buy / Sell
          </h1>
        </Reveal>

        <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href={signupUrl} size="lg">
            Start trading
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="#leverage" variant="soft" size="lg">
            View leverage matrix
          </ButtonLink>
          <ButtonLink href="#how-to-trade" variant="soft" size="lg">
            Buy / Sell walkthrough
          </ButtonLink>
        </Reveal>

        <p className="text-faint mt-5 max-w-2xl text-xs leading-relaxed">
          {riskDisclosure}
        </p>
      </Container>
    </section>
  );
}

function LeverageTable() {
  return (
    <TableShell caption="Standard account leverage by asset class">
      <Table className="min-w-[520px]">
        <caption className="sr-only">
          Standard account leverage by asset class
        </caption>
        <thead>
          <tr>
            <Th className="pl-5">Account type</Th>
            <Th>Asset class</Th>
            <Th className="pr-5 text-right">Leverage</Th>
          </tr>
        </thead>
        <tbody>
          {standardLeverageSummary.map((row) => (
            <Tr key={row.label}>
              <Td className="text-ink pl-5 text-[0.8125rem] font-medium">
                Standard
              </Td>
              <Td className="text-muted text-[0.8125rem]">{row.label}</Td>
              <Td className="tabular text-ink pr-5 text-right font-mono text-[0.875rem] font-semibold">
                {row.leverage}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}

function ConversionBand() {
  return (
    <Section className="relative overflow-hidden">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative">
        <div className="border-line-soft bg-panel/80 rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
            <div>
              <span className="eyebrow">
                <span className="chev" />
                Ready to trade
              </span>
              <h2 className="text-h2 mt-5 max-w-2xl">
                Open an account and trade every published market from one login.
              </h2>
              <p className="text-lead text-muted mt-5 max-w-xl">
                Leverage, spreads and payment options are stated up front —
                including the Standard matrix on this page.
              </p>
              <p className="text-faint mt-4 max-w-xl text-xs leading-relaxed">
                {riskDisclosure}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href={signupUrl} size="lg">
                Start trading
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/trading/accounts" variant="soft" size="lg">
                Compare account types
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
