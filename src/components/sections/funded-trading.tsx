import { ArrowRight, Layers, ShieldCheck, TrendingUp } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { signupUrl } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

/**
 * Every figure in this section derives from these five constants, so the
 * comparison panels, the maths callout and the supporting arguments can never
 * drift apart. The tier referenced is Professional: $200,000 at a 90% split
 * for a refundable $899.
 */
const OWN_CAPITAL = 5_000;
const FUNDED_CAPITAL = 200_000;
const MONTHLY_RETURN = 0.04;
const SPLIT = 0.9;
const FEE = 899;
const RISK_PER_TRADE = 0.005;

const ownGross = OWN_CAPITAL * MONTHLY_RETURN;
const fundedGross = FUNDED_CAPITAL * MONTHLY_RETURN;
const fundedNet = fundedGross * SPLIT;
const advantage = Math.round(fundedNet / ownGross);
const equivalentCapital = fundedNet / MONTHLY_RETURN;
const ownDrawdown = OWN_CAPITAL * 0.1;
const fundedDrawdown = FUNDED_CAPITAL * 0.1;
const ownTradeRisk = OWN_CAPITAL * RISK_PER_TRADE;
const fundedTradeRisk = FUNDED_CAPITAL * RISK_PER_TRADE;

type ComparisonLine = {
  label: string;
  own: string;
  ownNote: string;
  funded: string;
  fundedNote: string;
};

const comparison: ComparisonLine[] = [
  {
    label: "Capital you have to find",
    own: formatCurrency(OWN_CAPITAL),
    ownNote: "Saved, deposited and exposed in full",
    funded: formatCurrency(FEE),
    fundedNote: "One evaluation fee, refunded with your first payout",
  },
  {
    label: "Buying power",
    own: formatCurrency(OWN_CAPITAL),
    ownNote: "Grows only when you deposit again",
    funded: formatCurrency(FUNDED_CAPITAL),
    fundedNote: "Live from the day the funded account is issued",
  },
  {
    label: "A 4% month, gross",
    own: formatCurrency(ownGross),
    ownNote: "The same skill, applied to a small base",
    funded: formatCurrency(fundedGross),
    fundedNote: "Identical trades, forty times the notional",
  },
  {
    label: "What actually reaches you",
    own: formatCurrency(ownGross),
    ownNote: "100% of a number that changes nothing",
    funded: formatCurrency(fundedNet),
    fundedNote: "90% split, paid weekly on Professional",
  },
  {
    label: "A 10% losing stretch",
    own: `\u2212${formatCurrency(ownDrawdown)}`,
    ownNote: "Straight out of your own net worth",
    funded: formatCurrency(0),
    fundedNote: `${formatCurrency(fundedDrawdown)} absorbed by us; the account simply closes`,
  },
  {
    label: "How you scale",
    own: "Deposit more",
    ownNote: "Growth is capped by what you can afford to lose",
    funded: "Up to $2,000,000",
    fundedNote: "Capital doubles on +10% across two payout cycles",
  },
];

const arguments_ = [
  {
    icon: ShieldCheck,
    title: "The risk sits on our balance sheet",
    body: `Your maximum loss is a fixed, refundable ${formatCurrency(FEE)}. Ours is the ${formatCurrency(fundedDrawdown)} the rulebook permits before an account is closed. That asymmetry is the entire product: we underwrite the variance so you can trade the strategy you already know without betting your savings on it.`,
  },
  {
    icon: TrendingUp,
    title: "Position sizing that finally matters",
    body: `A disciplined ${RISK_PER_TRADE * 100}% risk per trade is ${formatCurrency(ownTradeRisk)} on a ${formatCurrency(OWN_CAPITAL)} account and ${formatCurrency(fundedTradeRisk)} on a funded ${formatCurrency(FUNDED_CAPITAL)} one. Nothing about the setup changes. Only the scale of the outcome does, which is why edge is worth more here than it is at home.`,
  },
  {
    icon: Layers,
    title: "Years of compounding, skipped",
    body: `To clear ${formatCurrency(fundedNet)} in a 4% month with your own money you would need ${formatCurrency(equivalentCapital)} sitting in the account. The evaluation asks for ${formatCurrency(FEE)}, a profit target and four trading days. Capital stops being the bottleneck and consistency becomes the only one.`,
  },
];

export function FundedTradingSection() {
  return (
    <Section id="funded-trading" className="relative overflow-hidden">
      <GridBackdrop className="opacity-60" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Why trade funded capital"
          title="Your edge is worth more on someone else&rsquo;s balance sheet"
          lead="Most retail traders are not short of skill. They are short of size. Funded trading separates the two problems: you bring the strategy and the discipline, we bring the capital and carry the downside."
          action={
            <ButtonLink href="/how-it-works" variant="soft">
              See how the evaluation works
              <ArrowRight />
            </ButtonLink>
          }
        />

        <Reveal delay={0.08} className="mt-14">
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <ComparisonPanel
              tone="own"
              kicker="Scenario A"
              title="Trading your own capital"
              caption={`${formatCurrency(OWN_CAPITAL)} personal account`}
              lines={comparison}
            />
            <ComparisonPanel
              tone="funded"
              kicker="Scenario B"
              title="Trading Connect Funded capital"
              caption={`${formatCurrency(FUNDED_CAPITAL)} Professional account`}
              lines={comparison}
            />
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mt-5">
          <div className="border-line-soft bg-panel relative overflow-hidden rounded-2xl border">
            <div
              aria-hidden="true"
              className="bg-mint/15 pointer-events-none absolute -top-24 right-1/4 size-64 rounded-full blur-3xl"
            />
            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
              <div>
                <Badge tone="mint">The arithmetic</Badge>
                <p className="text-lead text-ink mt-4 max-w-2xl">
                  A 4% month on a {formatCurrency(OWN_CAPITAL)} personal account
                  pays {formatCurrency(ownGross)}. The same 4% month on a funded{" "}
                  {formatCurrency(FUNDED_CAPITAL)} account pays you{" "}
                  <span className="text-mint font-semibold">
                    {formatCurrency(fundedNet)}
                  </span>{" "}
                  at a 90% split.
                </p>
                <p className="text-muted mt-3 max-w-2xl text-sm">
                  Same instruments, same entries, same risk discipline. The only
                  variable is the size of the account behind the order, and that
                  is the one variable we are willing to solve for you.
                </p>
              </div>

              <dl className="border-line-soft grid shrink-0 grid-cols-3 gap-6 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <MathStat
                  label="Own account"
                  value={formatCurrency(ownGross)}
                />
                <MathStat
                  label="Funded, after split"
                  value={formatCurrency(fundedNet)}
                  tone="mint"
                />
                <MathStat label="Advantage" value={`${advantage}\u00d7`} />
              </dl>
            </div>
          </div>
        </Reveal>

        <StaggerGroup className="mt-5 grid gap-4 md:grid-cols-3">
          {arguments_.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel hover:border-brand/40 rounded-2xl border p-6 transition-colors duration-300"
              >
                <span className="bg-brand/12 text-brand-light ring-brand/20 inline-flex size-10 items-center justify-center rounded-xl ring-1">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-ink mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal
          delay={0.05}
          className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3"
        >
          <ButtonLink href={signupUrl} size="lg">
            Create account
            <ArrowRight />
          </ButtonLink>
          <p className="text-faint max-w-md text-xs">
            Illustrative figures based on the Professional tier. Returns are not
            guaranteed and past performance does not predict future results.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

function ComparisonPanel({
  tone,
  kicker,
  title,
  caption,
  lines,
}: {
  tone: "own" | "funded";
  kicker: string;
  title: string;
  caption: string;
  lines: ComparisonLine[];
}) {
  const funded = tone === "funded";

  return (
    <div
      className={
        funded
          ? "border-brand/35 bg-panel relative overflow-hidden rounded-2xl border shadow-[0_30px_80px_-50px_rgb(var(--cf-brand-glow)/0.9)]"
          : "border-line-soft bg-sunken/50 relative overflow-hidden rounded-2xl border"
      }
    >
      {funded ? (
        <div
          aria-hidden="true"
          className="bg-brand/20 pointer-events-none absolute -top-32 -left-16 size-72 rounded-full blur-3xl"
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--cf-border-soft) 0 1px, transparent 1px 11px)",
            maskImage: "linear-gradient(to bottom, #000, transparent 55%)",
          }}
        />
      )}

      <div className="relative p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={
              funded
                ? "text-brand-light font-mono text-[0.6875rem] tracking-[0.16em] uppercase"
                : "text-faint font-mono text-[0.6875rem] tracking-[0.16em] uppercase"
            }
          >
            {kicker}
          </span>
          {funded && <Badge tone="brand">Connect Funded</Badge>}
        </div>

        <h3
          className={
            funded
              ? "text-h3 text-ink mt-3"
              : "text-h3 mt-3 text-[color:var(--cf-text-muted)]"
          }
        >
          {title}
        </h3>
        <p
          className={
            funded
              ? "text-brand-light tabular mt-1.5 font-mono text-sm"
              : "text-faint tabular mt-1.5 font-mono text-sm"
          }
        >
          {caption}
        </p>

        <dl className="border-line-soft mt-6 divide-y divide-[color:var(--cf-border-soft)] border-t">
          {lines.map((line) => (
            <div
              key={line.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 gap-y-1 py-3.5"
            >
              <dt
                className={
                  funded
                    ? "text-muted text-sm"
                    : "text-faint text-sm"
                }
              >
                {line.label}
              </dt>
              <dd
                className={
                  funded
                    ? "text-ink tabular text-right font-mono text-base font-semibold"
                    : "text-faint tabular text-right font-mono text-base font-medium"
                }
              >
                {funded ? line.funded : line.own}
              </dd>
              <p className="text-faint col-span-2 text-xs">
                {funded ? line.fundedNote : line.ownNote}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function MathStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "mint";
}) {
  return (
    <div>
      <dt className="text-faint text-xs">{label}</dt>
      <dd
        className={
          tone === "mint"
            ? "text-mint tabular font-display mt-1 text-xl font-semibold sm:text-2xl"
            : "text-ink tabular font-display mt-1 text-xl font-semibold sm:text-2xl"
        }
      >
        {value}
      </dd>
    </div>
  );
}
