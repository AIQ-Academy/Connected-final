import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Info,
  Rocket,
  Scale,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { FundedTradingSection } from "@/components/sections/funded-trading";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { SectionHeading } from "@/components/ui/section-heading";
import { howItWorksStages } from "@/lib/content";
import { guardProduct } from "@/lib/product-guard";
import { signupUrl } from "@/lib/site";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "The full Connect Funded journey: choose a challenge, pass a two-phase evaluation, clear KYC and get paid. Drawdown rules explained with a worked example on a $100,000 account.",
};

/** Depth for each stage, keyed by the index carried on the shared content. */
const stageDetail: Record<
  string,
  { rules: string[]; checks: string; next: string }
> = {
  "01": {
    rules: [
      "Your tier fixes both profit targets and the dollar value of both drawdown floors for the life of the evaluation.",
      "Add-ons are chosen at checkout and cannot be attached to an account later.",
      "Payment must come from an instrument in your own name — we cannot accept third-party funding.",
    ],
    checks:
      "Your country against the restricted-jurisdiction list, and the payer name against sanctions screening. Both run automatically at checkout, before any money is captured.",
    next: "Platform credentials and a server address land in your inbox and in the portal. Card, wallet and crypto payments activate the account immediately; a bank transfer activates when the funds settle.",
  },
  "02": {
    rules: [
      "Reach the Phase 1 profit target for your tier: 10% on Starter, Essential and Growth, 9% on Advanced, 8% on Professional.",
      "Stay above the 5% daily drawdown floor and the 10% overall drawdown floor at every moment, floating profit and loss included.",
      "Trade on at least four days. A trading day is any day on which you open or close at least one position.",
      "There is no calendar deadline. Take a week or take six months.",
    ],
    checks:
      "Every tick. Drawdown is evaluated server-side at the platform, so a breach closes the account at the moment it occurs rather than being adjudicated the following morning. The portal shows your live headroom against both floors while you trade.",
    next: "Once the target prints and the fourth trading day is complete, Phase 2 is provisioned within one business day, reset to the balance you started Phase 1 with.",
  },
  "03": {
    rules: [
      "The profit target halves: 5% on Starter, Essential, Growth and Advanced, 4% on Professional.",
      "Identical risk limits — 5% daily, 10% overall — and the same four-day minimum.",
      "Still no time limit. Nothing about Phase 2 is more restrictive than Phase 1 except the target being lower.",
    ],
    checks:
      "A government-issued photo ID and a proof of address dated within the last three months, uploaded once inside the portal. One person, one identity: accounts opened under a second identity are closed and are not eligible for a refund.",
    next: "Documents are usually reviewed within a few hours on a business day. When both the target and the verification are complete, your funded account is issued with the same platform credentials you have been using.",
  },
  "04": {
    rules: [
      "Keep 80% to 90% of net realised profit, set by your tier and any split add-on.",
      "Payout cycles run every 14 days, or every 7 on Professional and with the weekly add-on.",
      "The drawdown floors carry over to the funded account unchanged. Funding is not the end of risk management.",
      "You can request any amount up to your accrued profit, with no minimum and no cap.",
    ],
    checks:
      "Your trade log is screened against the three prohibited behaviours before the first release. It is a screen rather than a hurdle: a clean log clears automatically, and if anything is flagged you receive the evidence behind it.",
    next: "Approved requests are released within 24 to 48 hours. Your evaluation fee is refunded in full alongside the first payout, and the scaling clock starts on the cycle you have just closed.",
  },
};

/** Worked example on a $100,000 account. Every figure is derived here. */
const EXAMPLE_BALANCE = 100_000;
const DAILY_LIMIT = EXAMPLE_BALANCE * 0.05;
const OVERALL_FLOOR = EXAMPLE_BALANCE * 0.9;

const walkthrough = [
  {
    moment: "Day 1 · 00:00 UTC",
    equity: 100_000,
    anchor: 100_000,
    note: "The evaluation opens. The daily anchor is your starting balance.",
  },
  {
    moment: "Day 1 · close, up $3,200",
    equity: 103_200,
    anchor: 100_000,
    note: "A profitable day does not move the daily floor until the reset.",
  },
  {
    moment: "Day 2 · 00:00 UTC reset",
    equity: 103_200,
    anchor: 103_200,
    note: "Equity is above the starting balance, so it becomes the new anchor.",
  },
  {
    moment: "Day 2 · close, down $4,700",
    equity: 98_500,
    anchor: 103_200,
    note: "Inside the daily floor by $300 — and still $8,500 above the overall floor.",
  },
  {
    moment: "Day 3 · 00:00 UTC reset",
    equity: 98_500,
    anchor: 100_000,
    note: "Equity is below the starting balance, so the anchor reverts to it.",
  },
] as const;

const payoutMechanics = [
  {
    icon: Clock,
    title: "When a cycle closes",
    body: "The first cycle opens the day your funded account is issued and closes 14 days later, or 7 on Professional. From that moment the request button is live in the portal and stays live — a cycle you do not draw on simply rolls its profit forward.",
  },
  {
    icon: Timer,
    title: "The 24 to 48 hour window",
    body: "Requests are reviewed on the business day they arrive. Once approved, funds leave within 24 to 48 hours. Crypto usually lands the same day, e-wallets within 24 hours, cards and bank transfers in one to three business days depending on the rail.",
  },
  {
    icon: Wallet,
    title: "We absorb the fee",
    body: "Connect Funded pays the processing cost on every payout method, including network fees on crypto. The figure you request is the figure that leaves us. Your own bank or wallet provider may still apply a charge at their end.",
  },
  {
    icon: Banknote,
    title: "Your fee comes back",
    body: "The evaluation fee you paid is refunded in full on top of your first payout on any account that reaches funded status. It is not credit and it is not a discount on a future purchase — it is returned to you as money.",
  },
] as const;

const timeline = [
  {
    label: "Purchase to credentials",
    fast: "Minutes",
    typical: "Minutes",
    note: "Instant on card, wallet and crypto. One to two business days if you send a bank transfer.",
  },
  {
    label: "Phase 1",
    fast: "4 trading days",
    typical: "3 to 5 weeks",
    note: "The floor is four trading days. Most traders who pass take considerably longer, because there is no reason to rush.",
  },
  {
    label: "Phase 2",
    fast: "4 trading days",
    typical: "2 to 4 weeks",
    note: "A lower target under identical limits, so it usually resolves faster than Phase 1.",
  },
  {
    label: "KYC review",
    fast: "A few hours",
    typical: "Same business day",
    note: "Upload your documents during Phase 2 and this step disappears from the critical path entirely.",
  },
  {
    label: "Funded account issued",
    fast: "Same day",
    typical: "Within 1 business day",
    note: "Same platform, same credentials, new balance and a live payout cycle.",
  },
  {
    label: "First payout cycle",
    fast: "7 days",
    typical: "14 days",
    note: "Seven days on Professional or with the weekly add-on, otherwise fourteen.",
  },
  {
    label: "Payout release",
    fast: "24 hours",
    typical: "24 to 48 hours",
    note: "Measured from approval, not from the moment you click request.",
  },
] as const;

export default async function HowItWorksPage() {
  await guardProduct("funded");

  return (
    <>
      <PageHero />

      <FundedTradingSection />

      <Section id="journey" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <SectionHeading
            eyebrow="The journey"
            title="Four stages, no surprises between them."
            lead="Each stage has a published rule set, a defined check and a defined outcome. Nothing about the path from purchase to payout is discretionary."
          />

          <div className="mt-14 space-y-6">
            {howItWorksStages.map((stage, index) => {
              const detail = stageDetail[stage.index];

              return (
                <Reveal
                  key={stage.index}
                  delay={index * 0.04}
                  className="border-line-soft bg-panel overflow-hidden rounded-3xl border"
                >
                  <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="border-line-soft bg-sunken/40 border-b p-6 sm:p-8 lg:border-r lg:border-b-0 lg:p-10">
                      <div className="flex items-center gap-4">
                        <span className="text-brand-light font-display text-4xl leading-none font-semibold">
                          {stage.index}
                        </span>
                        <Badge tone="brand" size="md">
                          {stage.kicker}
                        </Badge>
                      </div>

                      <h2 className="text-h3 mt-6">{stage.title}</h2>
                      <p className="text-muted mt-3 leading-relaxed">
                        {stage.body}
                      </p>

                      <ul className="mt-7 space-y-2.5">
                        {stage.points.map((point) => (
                          <li key={point} className="flex gap-2.5">
                            <CheckCircle2
                              className="text-mint mt-0.5 size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-muted text-[0.8125rem] leading-snug">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-7 p-6 sm:p-8 lg:p-10">
                      <div>
                        <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                          The rules that apply
                        </h3>
                        <ul className="mt-3 space-y-2.5">
                          {detail.rules.map((rule) => (
                            <li key={rule} className="flex gap-2.5">
                              <span
                                className="chev mt-1.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-muted text-[0.875rem] leading-relaxed">
                                {rule}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid gap-7 sm:grid-cols-2">
                        <div>
                          <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                            What we check
                          </h3>
                          <p className="text-muted mt-3 text-[0.875rem] leading-relaxed">
                            {detail.checks}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                            What happens next
                          </h3>
                          <p className="text-muted mt-3 text-[0.875rem] leading-relaxed">
                            {detail.next}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section id="drawdown" className="border-line-soft bg-raised/40 border-y">
        <Container>
          <SectionHeading
            eyebrow="What the rules actually mean"
            title="Two drawdown limits, measured two different ways."
            lead="More evaluations end on a misunderstanding of these two lines than on a bad trade. Here is precisely how each one is calculated, on a $100,000 account."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <Activity className="text-amber size-4" aria-hidden="true" />
                <h3 className="text-ink font-display text-base font-semibold">
                  Daily drawdown · 5%
                </h3>
              </div>
              <p className="text-muted mt-4 text-sm leading-relaxed">
                Measured against an anchor that resets at 00:00 UTC every day.
                The anchor is the <strong className="text-ink">higher</strong>{" "}
                of your starting balance or your equity at that reset, and the
                floor sits {formatCurrency(DAILY_LIMIT, { decimals: 0 })} — 5%
                of the initial balance — below it.
              </p>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                It includes floating profit and loss, so an open position that
                is deep in the red counts against you before you close it. A
                profitable day raises the anchor, which means the floor rises
                with your equity and never falls below{" "}
                {formatCurrency(EXAMPLE_BALANCE - DAILY_LIMIT, { decimals: 0 })}
                .
              </p>
            </Reveal>

            <Reveal
              delay={0.08}
              className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8"
            >
              <div className="flex items-center gap-2.5">
                <Scale className="text-loss size-4" aria-hidden="true" />
                <h3 className="text-ink font-display text-base font-semibold">
                  Overall drawdown · 10%
                </h3>
              </div>
              <p className="text-muted mt-4 text-sm leading-relaxed">
                Static. It is set once, at{" "}
                {formatCurrency(OVERALL_FLOOR, { decimals: 0 })} on a{" "}
                {formatCurrency(EXAMPLE_BALANCE, { decimals: 0 })} account, and
                it does not move for the life of the evaluation. It does not
                trail your profit and it is not recalculated after a good week.
              </p>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                Because the daily anchor never drops below your starting
                balance, the daily floor is the line that binds in ordinary
                trading. The overall floor is the backstop: it is what catches
                an overnight or weekend gap that jumps straight past the daily
                level in a single print.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="mt-8">
            <TableShell caption="Worked example of both drawdown floors across three days on a $100,000 account">
              <Table className="min-w-[820px]">
                <caption className="sr-only">
                  Worked example of both drawdown floors across three days on a
                  $100,000 account
                </caption>
                <thead>
                  <tr>
                    <Th className="pl-5">Moment</Th>
                    <Th className="text-right">Equity</Th>
                    <Th className="text-right">Daily anchor</Th>
                    <Th className="text-right">Daily floor</Th>
                    <Th className="text-right">Overall floor</Th>
                    <Th className="pr-5 text-right">Headroom</Th>
                  </tr>
                </thead>
                <tbody>
                  {walkthrough.map((step) => {
                    const dailyFloor = step.anchor - DAILY_LIMIT;
                    const headroom = step.equity - dailyFloor;

                    return (
                      <Tr key={step.moment}>
                        <Td className="pl-5">
                          <span className="text-ink block text-[0.8125rem] font-medium">
                            {step.moment}
                          </span>
                          <span className="text-faint mt-0.5 block text-xs">
                            {step.note}
                          </span>
                        </Td>
                        <Td className="tabular text-ink text-right font-mono text-[0.8125rem]">
                          {formatCurrency(step.equity, { decimals: 0 })}
                        </Td>
                        <Td className="tabular text-muted text-right font-mono text-[0.8125rem]">
                          {formatCurrency(step.anchor, { decimals: 0 })}
                        </Td>
                        <Td className="tabular text-amber text-right font-mono text-[0.8125rem]">
                          {formatCurrency(dailyFloor, { decimals: 0 })}
                        </Td>
                        <Td className="tabular text-loss text-right font-mono text-[0.8125rem]">
                          {formatCurrency(OVERALL_FLOOR, { decimals: 0 })}
                        </Td>
                        <Td
                          className={cn(
                            "tabular pr-5 text-right font-mono text-[0.8125rem] font-medium",
                            headroom > 1_000 ? "text-mint" : "text-amber",
                          )}
                        >
                          {formatCurrency(headroom, { decimals: 0 })}
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableShell>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="border-loss/25 bg-loss/5 mt-6 flex items-start gap-4 rounded-2xl border p-6 sm:p-7">
              <Info
                className="text-loss mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-ink text-[0.9375rem] font-semibold">
                  The breach case
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Had that day-two loss reached $5,100 rather than $4,700,
                  equity would have touched $98,100 — one hundred dollars below
                  the $98,200 daily floor — and the account would have closed
                  there and then, with $8,100 still standing between you and the
                  $90,000 overall floor. That is the whole lesson: after a good
                  day, the number you have to respect is the one measured from
                  your new high, not from where you started.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="payouts">
        <Container>
          <SectionHeading
            eyebrow="Payout mechanics"
            title="How money actually leaves the desk."
            lead="A payout is a request, a review and a transfer. None of those three steps is designed to be slow, and none of them costs you anything."
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {payoutMechanics.map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
              >
                <item.icon
                  className="text-brand-light size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.1}>
            <div className="border-mint/30 bg-mint/5 mt-6 rounded-3xl border p-6 sm:p-8">
              <span className="eyebrow text-mint">
                <span className="chev" />A first payout, in full
              </span>
              <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <p className="text-muted text-sm leading-relaxed">
                    A trader on the {formatCurrency(100_000, { decimals: 0 })}{" "}
                    Advanced account closes their first 14-day cycle{" "}
                    {formatCurrency(6_000, { decimals: 0 })} up in net realised
                    profit. The split on that tier is 85%, so the payout is{" "}
                    {formatCurrency(5_100, { decimals: 0 })}. Because it is the
                    first payout, the {formatCurrency(499, { decimals: 0 })}{" "}
                    evaluation fee is refunded alongside it.
                  </p>
                  <p className="text-faint mt-3 text-xs leading-relaxed">
                    Net realised profit means closed positions only. An open
                    winner is not counted until you close it, and the processing
                    fee on the transfer is ours, not yours.
                  </p>
                </div>
                <dl className="border-mint/25 shrink-0 border-t pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                  <dt className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                    Received
                  </dt>
                  <dd className="text-mint font-display tabular mt-2 text-4xl font-semibold">
                    {formatCurrency(5_599, { decimals: 0 })}
                  </dd>
                  <dd className="text-faint mt-2 font-mono text-xs">
                    5,100 profit share + 499 fee refund
                  </dd>
                </dl>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="timeline" className="border-line-soft bg-raised/40 border-y">
        <Container>
          <SectionHeading
            eyebrow="What to expect"
            title="From purchase to first payout."
            lead="Realistic elapsed time, stage by stage. The fast column assumes everything lands the first time; the typical column is what most traders actually see."
          />

          <Reveal className="mt-12">
            <TableShell caption="Expected elapsed time for each stage from purchase to first payout">
              <Table className="min-w-[760px]">
                <caption className="sr-only">
                  Expected elapsed time for each stage from purchase to first
                  payout
                </caption>
                <thead>
                  <tr>
                    <Th className="pl-5">Stage</Th>
                    <Th className="text-right">Fastest</Th>
                    <Th className="text-right">Typical</Th>
                    <Th className="pr-5">Notes</Th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((row) => (
                    <Tr key={row.label}>
                      <Td className="text-ink pl-5 text-[0.8125rem] font-medium">
                        {row.label}
                      </Td>
                      <Td className="tabular text-mint text-right font-mono text-[0.8125rem]">
                        {row.fast}
                      </Td>
                      <Td className="tabular text-muted text-right font-mono text-[0.8125rem]">
                        {row.typical}
                      </Td>
                      <Td className="text-faint max-w-md pr-5 text-xs leading-relaxed">
                        {row.note}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableShell>
          </Reveal>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Reveal className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7">
              <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                Fastest realistic path
              </p>
              <p className="text-ink font-display mt-3 text-3xl font-semibold">
                About four weeks
              </p>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                Eight trading days across both phases is roughly twelve calendar
                days. Add a day to issue the funded account, fourteen for the
                first cycle and two to release the transfer, and money is in
                your hands around day twenty-nine.
              </p>
            </Reveal>
            <Reveal
              delay={0.08}
              className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
            >
              <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                Typical path
              </p>
              <p className="text-ink font-display mt-3 text-3xl font-semibold">
                Eight to twelve weeks
              </p>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                Which is the more honest number. Nobody who trades their normal
                size hits a 10% target in four sessions, and the traders who try
                are the ones who meet the daily floor on the way.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="scaling-teaser" className="relative overflow-hidden">
        <Aurora intensity="subtle" />
        <Container className="relative">
          <div className="border-line-soft bg-panel/80 grid gap-10 rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center lg:p-14">
            <div>
              <span className="eyebrow">
                <span className="chev" />
                And then it grows
              </span>
              <h2 className="text-h2 mt-5 max-w-2xl">
                The first payout is the start of the ladder, not the finish
                line.
              </h2>
              <p className="text-lead text-muted mt-5 max-w-xl">
                Return 10% cumulatively across two consecutive payout cycles and
                your allocation doubles. Do it again and it doubles again, with
                the split rising to 90% and never coming back down, up to a
                ceiling of $2,000,000.
              </p>
              <ul className="text-muted mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Rocket className="text-mint size-4" aria-hidden="true" />
                  Capital doubles per milestone
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck
                    className="text-mint size-4"
                    aria-hidden="true"
                  />
                  Split never decreases
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/accounts#scaling" size="lg">
                See the scaling plan
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/payments" variant="soft" size="lg">
                Payout methods
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <ConversionBand />
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="strong" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              How it works
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              Evaluation, verification,{" "}
              <span className="text-gradient">payout.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              Four stages between buying a challenge and withdrawing profit. No
              hidden consistency rule, no time limit, and no clause that only
              appears once you are winning.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              Create account
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#drawdown" variant="soft" size="lg">
              Read the drawdown rules
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <ol className="border-line-soft mt-14 grid gap-8 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksStages.map((stage) => (
              <li key={stage.index}>
                <div className="flex items-baseline gap-3">
                  <span className="text-brand-light font-mono text-[0.75rem] tracking-[0.16em]">
                    {stage.index}
                  </span>
                  <span className="text-ink font-display text-base font-semibold">
                    {stage.title}
                  </span>
                </div>
                <p className="text-faint mt-2 max-w-xs pr-6 text-[0.8125rem] leading-snug">
                  {stage.kicker}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}

function ConversionBand() {
  return (
    <Section className="border-line-soft relative overflow-hidden border-t">
      <Aurora intensity="medium" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">
            <span className="chev" />
            Stage one
          </span>
          <h2 className="text-h2 mt-5">
            You are four steps from a funded account.
          </h2>
          <p className="text-lead text-muted mt-5">
            Pick a size, pass two phases, verify once, get paid every cycle. The
            fee comes back with your first payout.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={signupUrl} size="lg">
              Create account
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/accounts" variant="soft" size="lg">
              Compare account tiers
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
