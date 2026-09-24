import Image from "next/image";
import { ArrowRight, Check, RefreshCw, ShieldCheck, Timer } from "lucide-react";

import {
  AccountStepRail,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/reveal";
import { Aurora } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AccountTier } from "@/db/schema";
import type { Heading } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { signupUrl } from "@/lib/site";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

/**
 * The home page shows the entry tier, the tier most traders choose and the
 * ceiling. The full five-tier matrix lives on /accounts, which is where a
 * trader who is genuinely comparing rules ends up anyway.
 */
function headlineTiers(tiers: AccountTier[]) {
  if (tiers.length <= 3) return tiers;
  const sorted = [...tiers].sort((a, b) => a.accountSize - b.accountSize);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const middle =
    sorted.find((tier) => tier.isFeatured && tier !== first && tier !== last) ??
    sorted[Math.floor(sorted.length / 2)];
  return [first, middle, last];
}

/**
 * Percentages are the published rule, but a trader sizing an account thinks in
 * dollars — so every rule carries the figure it works out to on this tier.
 */
function tierMetrics(tier: AccountTier) {
  const dollars = (pct: number) =>
    formatCurrency((tier.accountSize * pct) / 100);

  return [
    {
      label: "Profit target",
      value: `${tier.phase1TargetPct}% → ${tier.phase2TargetPct}%`,
      hint: `${dollars(tier.phase1TargetPct)} then ${dollars(tier.phase2TargetPct)}`,
    },
    {
      label: "Drawdown",
      value: `${tier.maxDailyDrawdownPct}% / ${tier.maxOverallDrawdownPct}%`,
      hint: `${dollars(tier.maxDailyDrawdownPct)} / ${dollars(tier.maxOverallDrawdownPct)}`,
    },
    {
      label: "Payouts",
      value: tier.payoutFrequency === "weekly" ? "Weekly" : "Bi-weekly",
      hint: "released in 24–48h",
    },
    {
      label: "Min. days",
      value: `${tier.minTradingDays} days`,
      hint: "no time limit",
    },
  ];
}

const sharedPromises = [
  {
    icon: ShieldCheck,
    label: "Identical rulebook",
    detail: "Targets and floors do not loosen or tighten by size",
  },
  {
    icon: RefreshCw,
    label: "Fee refunded",
    detail: "Returned in full with your first funded payout",
  },
  {
    icon: Timer,
    label: "No time limit",
    detail: "Pass either phase on your own calendar",
  },
] as const;

const defaultHeading: Heading = {
  eyebrow: "Account tiers",
  title: "Pick the capital. The rules never change.",
  lead: "Targets, drawdown limits and the refund policy are identical at every size. Only the allocation, the fee and your split move.",
  actionHref: "/accounts",
  actionLabel: "Compare all {count} tiers",
};

export function AccountTypesSection({
  tiers,
  heading = defaultHeading,
  image,
}: {
  tiers: AccountTier[];
  heading?: Heading;
  image?: ResolvedImage;
}) {
  const selection = headlineTiers(tiers);
  const banner = image ?? marketingImages.accountTiers;
  const highlight = selection[1];
  const sortedAll = [...tiers].sort((a, b) => a.accountSize - b.accountSize);
  const minSize = sortedAll[0]?.accountSize ?? 10_000;
  const maxSize = sortedAll[sortedAll.length - 1]?.accountSize ?? 200_000;

  return (
    <Section
      id="account-types"
      size="spacious"
      className="relative isolate overflow-hidden"
    >
      <Aurora intensity="subtle" className="opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_0%,rgb(var(--cf-brand-glow)/0.12),transparent_70%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          action={
            <ButtonLink href={heading.actionHref} variant="outline">
              {heading.actionLabel.replace("{count}", String(tiers.length))}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <Reveal className="border-line-soft bg-panel/70 mt-10 grid overflow-hidden rounded-3xl border backdrop-blur-sm lg:mt-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative min-h-[14rem] lg:min-h-[18rem]">
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              {...("blurDataURL" in banner && banner.blurDataURL
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: banner.blurDataURL,
                  }
                : {})}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_10_20/0.88)_0%,rgb(8_10_20/0.25)_50%,transparent_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-white/60 uppercase">
                Capital range
              </p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {formatCompactCurrency(minSize)}
                <span className="mx-2 text-white/40">→</span>
                {formatCompactCurrency(maxSize)}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                Five sizes, one evaluation model — scale after you are funded,
                not during the challenge.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
            <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              Shared across every tier
            </p>
            <ul className="space-y-4">
              {sharedPromises.map((item) => (
                <li key={item.label} className="flex gap-3.5">
                  <span className="bg-brand/10 text-brand-light ring-brand/20 grid size-10 shrink-0 place-items-center rounded-xl ring-1">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-ink text-sm font-semibold">
                      {item.label}
                    </p>
                    <p className="text-muted mt-0.5 text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="relative mt-10 sm:mt-12 lg:mt-14">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase lg:hidden">
            Swipe to compare tiers
          </p>

          <StaggerGroup
            role="list"
            className="mobile-snap-rail-lg items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-6"
          >
            {selection.map((tier) => {
              const featured = tier === highlight;
              return (
                <StaggerItem
                  role="listitem"
                  key={tier.id}
                  preset="card"
                  delay={featured ? 0.3 : 0}
                  className="mobile-snap-card h-full w-[min(88vw,22rem)] lg:w-auto"
                >
                  <TierCard
                    tier={tier}
                    rank={sortedAll.findIndex((item) => item.id === tier.id) + 1}
                    total={sortedAll.length}
                    featured={featured}
                  />
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-soft bg-raised/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-muted text-sm leading-relaxed">
            Need the full five-tier matrix, configurator and scaling ladder?
          </p>
          <ButtonLink href="/accounts#compare" variant="ghost" size="sm">
            Open the comparison
            <ArrowRight />
          </ButtonLink>
        </Reveal>
      </Container>
    </Section>
  );
}

function TierCard({
  tier,
  rank,
  total,
  featured,
}: {
  tier: AccountTier;
  rank: number;
  total: number;
  featured: boolean;
}) {
  return (
    /* Hairline gradient frame: a 1px padded wrapper reads as a lit edge on the
       featured tier without the flat ring a plain border colour gives. */
    <div
      data-featured={featured ? true : undefined}
      className={cn(
        "account-type-card group relative h-full rounded-[2rem] p-px",
        featured
          ? "bg-[linear-gradient(150deg,rgb(var(--cf-brand-glow)/0.9),rgb(var(--cf-brand-glow)/0.2)_40%,var(--cf-border-soft)_80%)]"
          : "bg-line-soft lg:hover:bg-brand/30",
      )}
    >
      <article
        className={cn(
          "bg-panel relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1px)]",
          featured &&
            "shadow-[0_32px_80px_-48px_rgb(var(--cf-brand-glow)/0.85)]",
        )}
      >
        {featured ? (
          <span
            aria-hidden
            className="account-card-featured-idle pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--cf-brand-glow)/0.9),transparent)]"
          />
        ) : null}
        {/* The capital sits on its own tinted plate so the eye lands on size
            and split before the rulebook underneath. */}
        <div
          className={cn(
            "border-line-soft relative border-b p-6 transition-colors duration-300 sm:p-7",
            featured
              ? "bg-[linear-gradient(180deg,rgb(var(--cf-brand-glow)/0.16),rgb(var(--cf-brand-glow)/0.05))]"
              : "bg-sunken lg:group-hover:bg-brand/5",
          )}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-ink text-xl font-semibold">
                {tier.name}
              </h3>
              <p className="text-faint mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                {tier.maxLeverage} leverage
              </p>
            </div>
            {featured ? <Badge tone="brand">Most chosen</Badge> : null}
          </header>

          <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div>
              <p className="font-display text-ink text-[2.75rem] leading-none font-semibold tracking-tight">
                {formatCompactCurrency(tier.accountSize)}
              </p>
              <p className="text-faint mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                Allocation
              </p>
            </div>
            <div className="text-right">
              <p className="text-mint font-mono text-2xl leading-none font-semibold">
                {tier.profitSplitPct}%
              </p>
              <p className="text-faint mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                Your split
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-faint flex items-baseline justify-between font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              <span>Capital step</span>
              <span className="tabular">
                {String(rank).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
            </div>
            <AccountStepRail
              rank={rank}
              total={total}
              featured={featured}
              fillDelay={featured ? 0.55 : 0.38}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="text-ink tabular text-sm font-semibold">
              {formatCurrency(tier.price)}
            </span>
            <span className="text-faint text-sm">one-time</span>
            <Badge tone="mint">Fee refunded</Badge>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2">
            {tierMetrics(tier).map((metric) => (
              <div
                key={metric.label}
                className="border-line-soft bg-sunken/70 rounded-md border px-3 py-2.5"
              >
                <dt className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                  {metric.label}
                </dt>
                <dd>
                  <span className="text-ink tabular block text-[0.8125rem] font-semibold">
                    {metric.value}
                  </span>
                  <span className="text-faint tabular mt-0.5 block text-[0.625rem]">
                    {metric.hint}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="text-muted mt-auto flex items-center gap-2 pt-5 text-[0.8125rem]">
            <Check className="text-mint size-3.5 shrink-0" aria-hidden />
            All assets · MT5, cTrader, Web
          </div>

          <ButtonLink
            href={signupUrl}
            variant={featured ? "primary" : "soft"}
            block
            className="mt-5"
          >
            Create account
            <ArrowRight className="transition-transform duration-300 lg:group-hover:translate-x-0.5" />
          </ButtonLink>
        </div>
      </article>
    </div>
  );
}
