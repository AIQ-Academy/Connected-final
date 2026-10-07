import type { Metadata } from "next";
import {
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Gauge,
  Rocket,
  ShieldCheck,
  Target,
  Timer,
} from "lucide-react";

import { ChallengeConfigurator } from "@/components/accounts/challenge-configurator";
import { ScalingLadder } from "@/components/accounts/scaling-ladder";
import { TierComparison } from "@/components/accounts/tier-comparison";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAccountTiers } from "@/db/queries";
import { guardProduct } from "@/lib/product-guard";
import { signupUrl } from "@/lib/site";
import type { AccountTier } from "@/db/schema";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Funded Account Tiers",
  description:
    "Five evaluation tiers from $10,000 to $200,000. Compare every published rule, configure your challenge with add-ons, and see exactly how the scaling plan reaches $2,000,000.",
};

const heroStats = [
  { value: "$10K – $200K", label: "Account sizes" },
  { value: "80 – 90%", label: "Profit split" },
  { value: "No limit", label: "Time to pass" },
  { value: "$2,000,000", label: "Scaling ceiling" },
] as const;

const permitted = [
  {
    title: "Expert advisors and custom indicators",
    body: "Run any EA, cBot or indicator you like. There is no whitelist and no approval step before you deploy one.",
  },
  {
    title: "Algorithmic and automated execution",
    body: "Fully systematic strategies are welcome on every tier, including strategies that place hundreds of orders a day.",
  },
  {
    title: "News trading",
    body: "Trade straight through CPI, payrolls and central-bank decisions. We never force a position closed ahead of a scheduled release.",
  },
  {
    title: "Weekend and overnight holds",
    body: "Positions can stay open across the Friday close and through the daily rollover. Swap is charged in the normal way.",
  },
  {
    title: "Copy-trading between your own accounts",
    body: "Mirror one of your accounts onto another up to $400,000 of combined allocation, which is the per-trader exposure limit.",
  },
  {
    title: "Hedging inside a single account",
    body: "Opposing positions on the same instrument in the same account are permitted on all three platforms.",
  },
] as const;

const prohibited = [
  {
    title: "Latency arbitrage",
    body: "Exploiting the delay between a faster upstream feed and our quote is not trading the market — it is trading our infrastructure.",
  },
  {
    title: "Tick scalping against stale quotes",
    body: "Systematically hitting prices that are known to be off-market during a gap or a feed interruption falls under the same principle.",
  },
  {
    title: "Reverse-account hedging between traders",
    body: "Opening opposing positions across accounts held by different traders to guarantee that one side passes is a breach for every account involved.",
  },
] as const;

const guidance = [
  {
    icon: Target,
    title: "New to funded evaluations",
    body: "Start at $10,000 or $25,000. The rulebook is identical to the largest tier, so the habits you build transfer upward without a single change to your process, and the fee at risk is small.",
    tier: "Starter · Essential",
  },
  {
    icon: Gauge,
    title: "Already trading a live book",
    body: "Size the account so your normal risk per trade sits between 0.25% and 0.5%. On $50,000 that is $125 to $250 a trade, which leaves real room inside the 5% daily limit for a losing sequence.",
    tier: "Growth · Advanced",
  },
  {
    icon: Rocket,
    title: "Running a proven system",
    body: "Take the largest tier your strategy can actually fill. Professional carries the lowest targets in the range — 8% then 4% — the 90% split and a weekly payout cycle as standard.",
    tier: "Professional",
  },
] as const;

export default async function AccountsPage() {
  await guardProduct("funded");

  const tiers = await getAccountTiers();

  return (
    <>
      <PageHero />

      <Section id="tiers" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <SectionHeading
            eyebrow="The five tiers"
            title="One rulebook. Five sizes."
            lead="Spreads, execution, platform access and risk limits are identical across the range. Only the capital, the fee and the profit split move."
          />

          <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {tiers.map((tier, index) => (
              <StaggerItem
                key={tier.id}
                className={cn(
                  // Deliberate 3 + 2 layout: the last two cards run wider
                  // rather than leaving a ragged final row.
                  "lg:col-span-2",
                  index >= 3 && "lg:col-span-3",
                )}
              >
                <TierCard tier={tier} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section
        id="configure"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="Challenge configurator"
            title="Build the exact evaluation you want."
            lead="Pick a size, a platform and any add-ons. Every rule and every dollar figure below updates as you go — this is the same arithmetic the checkout runs."
          />
          <Reveal className="mt-12">
            <ChallengeConfigurator tiers={tiers} />
          </Reveal>
        </Container>
      </Section>

      <Section id="compare">
        <Container>
          <SectionHeading
            eyebrow="Rules at a glance"
            title="Published, compared, enforced automatically."
            lead="Nothing here is discretionary. Drawdown limits are evaluated server-side at the platform, so a breach is never adjudicated by hand after the fact."
          />
          <Reveal className="mt-12">
            <TierComparison tiers={tiers} />
          </Reveal>
          <p className="text-faint mt-4 text-xs">
            Dollar figures are calculated against the initial account balance.
            Add-ons purchased at checkout override the values shown here.
          </p>
        </Container>
      </Section>

      <Section
        id="scaling"
        className="border-line-soft bg-raised/40 relative overflow-hidden border-y"
      >
        <Aurora intensity="subtle" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Scaling plan"
            title="Bank 10% twice and your capital doubles."
            lead="Return 10% cumulatively across two consecutive payout cycles and we double your allocation. The split rises with it, never decreases, and the ladder runs to a $2,000,000 ceiling."
            action={
              <ButtonLink href="/how-it-works" variant="soft">
                How the cycles work
              </ButtonLink>
            }
          />
          <div className="mt-14">
            <ScalingLadder />
          </div>
        </Container>
      </Section>

      <Section id="rules">
        <Container>
          <SectionHeading
            eyebrow="Rules and restrictions"
            title="Trade how you actually trade."
            lead="We restrict three things, and all three describe the same behaviour: extracting profit from a pricing artefact rather than from the market. Everything else is yours to run."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Reveal className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="text-mint size-4" aria-hidden="true" />
                <h3 className="text-ink font-display text-base font-semibold">
                  Permitted on every tier
                </h3>
              </div>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {permitted.map((rule) => (
                  <li key={rule.title}>
                    <p className="text-ink text-[0.875rem] font-semibold">
                      {rule.title}
                    </p>
                    <p className="text-muted mt-1.5 text-[0.8125rem] leading-relaxed">
                      {rule.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal
              delay={0.08}
              className="border-loss/25 bg-loss/5 rounded-3xl border p-6 sm:p-8"
            >
              <div className="flex items-center gap-2.5">
                <Ban className="text-loss size-4" aria-hidden="true" />
                <h3 className="text-ink font-display text-base font-semibold">
                  Not permitted
                </h3>
              </div>
              <ul className="mt-6 space-y-6">
                {prohibited.map((rule) => (
                  <li key={rule.title}>
                    <p className="text-ink text-[0.875rem] font-semibold">
                      {rule.title}
                    </p>
                    <p className="text-muted mt-1.5 text-[0.8125rem] leading-relaxed">
                      {rule.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="border-loss/20 text-faint mt-7 border-t pt-5 text-xs leading-relaxed">
                Breaches are reviewed against trade logs before any action is
                taken, and you receive the evidence behind the decision.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section
        id="choosing"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="Choosing a tier"
            title="Size the account to your risk, not your ambition."
            lead="The most common reason an evaluation fails is a position size the daily limit was never going to tolerate. Work backwards from the risk you already take."
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-3">
            {guidance.map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6"
              >
                <item.icon
                  className="text-brand-light size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 flex-1 text-sm leading-relaxed">
                  {item.body}
                </p>
                <p className="text-faint mt-5 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  {item.tier}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="border-line-soft bg-panel mt-10 rounded-3xl border px-6 sm:px-8">
            <Accordion>
              <AccordionItem
                question="Can I hold more than one evaluation at the same time?"
                defaultOpen
              >
                Yes. You can run several evaluations concurrently and hold up to
                $400,000 in combined funded allocation across accounts.
                Copy-trading between your own accounts is permitted inside that
                limit, and scaled capital counts toward it.
              </AccordionItem>
              <AccordionItem question="What happens if I breach a limit?">
                The account closes automatically at the moment of the breach —
                there is no review queue and no ambiguity about where you stood.
                You can start a new evaluation immediately, and a breach inside
                the first 14 days qualifies for a discounted reset.
              </AccordionItem>
              <AccordionItem question="Can I change tier after I have started?">
                Not mid-evaluation, because the profit target and the drawdown
                floors are fixed against the balance you started with. You can
                buy a different tier at any time and run both, or take the
                funded account and let the scaling plan grow it from there.
              </AccordionItem>
              <AccordionItem question="Do the add-ons change anything else?">
                No. Each add-on changes precisely the rule named on it and
                nothing else. The 8% overall drawdown option also reduces your
                Phase 1 target by two percentage points, which is stated on the
                option itself and applied in the configurator above.
              </AccordionItem>
              <AccordionItem question="Is the evaluation fee really refunded?">
                Yes, in full, alongside your first payout on any account that
                reaches funded status. If you have not placed a trade, you can
                request a full refund within 14 days of purchase instead.
              </AccordionItem>
            </Accordion>
          </Reveal>
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
              Trading accounts
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              Pick a challenge size that matches{" "}
              <span className="text-gradient">your strategy.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              Five tiers from $10,000 to $200,000, each running the same
              two-phase evaluation, the same 5% daily and 10% overall drawdown,
              and the same access to every asset class we quote.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#configure" size="lg">
              Configure a challenge
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#compare" variant="soft" size="lg">
              Compare every rule
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <dl className="border-line-soft mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t pt-8 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="text-ink font-display block text-xl font-semibold sm:text-2xl">
                    {stat.value}
                  </span>
                  <span className="text-faint mt-1 block text-xs">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}

function TierCard({ tier }: { tier: AccountTier }) {
  const highlights = [
    `${tier.phase1TargetPct}% then ${tier.phase2TargetPct}% profit target`,
    `${tier.maxDailyDrawdownPct}% daily · ${tier.maxOverallDrawdownPct}% overall drawdown`,
    `${tier.minTradingDays} minimum trading days, no time limit`,
    `${tier.profitSplitPct}% profit split`,
    `${tier.payoutFrequency === "weekly" ? "Weekly" : "Bi-weekly"} payouts, released in 24–48 hours`,
  ];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-[border-color,box-shadow,transform] duration-300 sm:p-7",
        tier.isFeatured
          ? "border-brand/45 bg-panel shadow-[0_28px_70px_-40px_rgb(var(--cf-brand-glow)/0.55)] ring-brand/20 ring-1"
          : "border-line-soft bg-panel hover:border-brand-light/45",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[3px]",
          tier.isFeatured
            ? "bg-gradient-to-r from-brand via-brand-light to-mint"
            : "bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-20 -right-14 size-40 rounded-full blur-3xl",
          tier.isFeatured ? "bg-brand/18 opacity-100" : "bg-brand/10 opacity-0 group-hover:opacity-80",
        )}
      />

      {tier.isFeatured && (
        <Badge tone="brand" className="absolute top-5 right-5 z-10">
          Most popular
        </Badge>
      )}

      <div className="relative flex items-baseline justify-between gap-3 pr-16">
        <h3 className="text-ink font-display text-lg font-semibold">
          {tier.name}
        </h3>
        <span className="text-faint font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
          {tier.maxLeverage}
        </span>
      </div>

      <p className="text-ink font-display relative mt-5 text-3xl font-semibold tracking-tight">
        {formatCurrency(tier.accountSize, { decimals: 0 })}
      </p>
      <p className="text-muted relative mt-1 text-sm">
        {formatCurrency(tier.price, { decimals: 0 })} evaluation fee
      </p>

      <div className="border-line-soft relative mt-5 flex items-end gap-2 border-t pt-5">
        <span className="font-mono text-2xl font-semibold text-ink">
          {tier.profitSplitPct}%
        </span>
        <span className="text-faint pb-0.5 text-xs">profit split</span>
      </div>

      <ul className="relative mt-5 flex-1 space-y-3">
        {highlights.map((line) => (
          <li key={line} className="flex gap-2.5">
            <Check
              className="text-mint mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span className="text-muted text-[0.8125rem] leading-snug">
              {line}
            </span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={signupUrl}
        variant={tier.isFeatured ? "primary" : "soft"}
        block
        className="relative mt-7"
      >
        Create account
      </ButtonLink>
    </article>
  );
}

function ConversionBand() {
  return (
    <Section className="relative overflow-hidden">
      <Aurora intensity="medium" />
      <Container className="relative">
        <div className="border-line-soft bg-panel/80 relative overflow-hidden rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
            <div>
              <span className="eyebrow">
                <span className="chev" />
                Ready when you are
              </span>
              <h2 className="text-h2 mt-5 max-w-2xl">
                The rules are published. The only thing left is the trading.
              </h2>
              <p className="text-lead text-muted mt-5 max-w-xl">
                Card and crypto payments activate the account immediately, and
                your evaluation fee comes back with your first payout.
              </p>
              <ul className="text-muted mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="text-mint size-4" aria-hidden="true" />
                  Segregated client funds
                </li>
                <li className="flex items-center gap-2">
                  <Timer className="text-mint size-4" aria-hidden="true" />
                  Instant activation
                </li>
                <li className="flex items-center gap-2">
                  <Rocket className="text-mint size-4" aria-hidden="true" />
                  Scaling to $2,000,000
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href={signupUrl} size="lg">
                Create account
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/payments" variant="soft" size="lg">
                See payment methods
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
