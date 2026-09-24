import { ArrowRight, Check } from "lucide-react";

import {
  AccountStepRail,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Heading } from "@/lib/cms/schemas";
import {
  brokerAccountTiers,
  brokerAccountTypesHeading,
  type BrokerAccountTier,
} from "@/lib/landing/broker";
import { cn, formatCurrency } from "@/lib/utils";

export function BrokerAccountTypesSection({
  heading = brokerAccountTypesHeading,
}: {
  heading?: Heading;
} = {}) {
  return (
    <Section id="account-types" size="spacious" className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_10%_0%,color-mix(in_oklab,var(--cf-mint)_8%,transparent),transparent_70%)]"
      />
      <Container className="relative">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          action={
            <ButtonLink href={heading.actionHref} variant="outline">
              {heading.actionLabel}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase lg:hidden">
            Swipe to compare accounts
          </p>
          <StaggerGroup
            role="list"
            className="mobile-snap-rail-lg items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-6"
          >
            {brokerAccountTiers.map((tier) => (
              <StaggerItem
                role="listitem"
                key={tier.code}
                preset="card"
                delay={tier.isFeatured ? 0.3 : 0}
                className="mobile-snap-card h-full w-[min(88vw,22rem)] lg:w-auto"
              >
                <BrokerAccountCard tier={tier} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Shared with the /trading/accounts comparison page so both surfaces render one
 * card from one array — the tier's position in that array is what the deposit
 * rail counts, so it is derived here rather than passed in from two call sites.
 */
export function BrokerAccountCard({ tier }: { tier: BrokerAccountTier }) {
  const featured = tier.isFeatured;
  const total = brokerAccountTiers.length;
  const rank =
    brokerAccountTiers.findIndex((item) => item.code === tier.code) + 1;
  const spreadParts = tier.spreadFrom?.split(" ") ?? [];
  const [spreadFigure, ...spreadUnit] = spreadParts;

  return (
    /* Hairline gradient frame: a 1px padded wrapper reads as a lit edge on the
       featured account without the flat ring a plain border colour gives. */
    <div
      data-featured={featured ? true : undefined}
      className={cn(
        "account-type-card group relative h-full rounded-[2rem] p-px",
        featured
          ? "bg-[linear-gradient(150deg,rgb(var(--cf-brand-glow)/0.9),rgb(var(--cf-brand-glow)/0.2)_40%,var(--cf-border-soft)_80%)]"
          : "bg-line-soft lg:hover:bg-mint/35",
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
        {/* Deposit sits on its own tinted plate so the eye lands on the
            number before the benefits underneath. Spread is a side stat only
            when the spec actually published one. */}
        <div
          className={cn(
            "border-line-soft relative border-b p-6 transition-colors duration-300 sm:p-7",
            featured
              ? "bg-[linear-gradient(180deg,rgb(var(--cf-brand-glow)/0.16),rgb(var(--cf-brand-glow)/0.05))]"
              : "bg-sunken lg:group-hover:bg-mint/5",
          )}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-ink text-xl font-semibold">
                {tier.name}
              </h3>
              <p className="text-faint mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                {tier.leverage ? `${tier.leverage} leverage` : "\u00a0"}
              </p>
            </div>
            {featured ? <Badge tone="brand">Most chosen</Badge> : null}
          </header>

          <div
            className={cn(
              "mt-7 grid items-end gap-4",
              spreadFigure ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1",
            )}
          >
            <div>
              <p className="font-display text-ink tabular text-[2.75rem] leading-none font-semibold tracking-tight">
                {formatCurrency(tier.minDeposit)}
              </p>
              <p className="text-faint mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                Minimum deposit
              </p>
            </div>
            {spreadFigure ? (
              <div className="text-right">
                <p className="text-mint tabular font-mono text-2xl leading-none font-semibold">
                  {spreadFigure}
                  {spreadUnit.length > 0 ? (
                    <span className="text-mint/80 ml-1 text-sm font-normal">
                      {spreadUnit.join(" ")}
                    </span>
                  ) : null}
                </p>
                <p className="text-faint mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  Spreads from
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <div className="text-faint flex items-baseline justify-between font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              <span>Deposit tier</span>
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
          <ul className="space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check
                  className="text-mint mt-0.5 size-3.5 shrink-0"
                  aria-hidden
                />
                <span className="text-ink text-sm leading-snug">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <ButtonLink
              href={`/register?type=broker&account=${tier.code}`}
              variant={featured ? "primary" : "soft"}
              block
            >
              Open {tier.name} Account
              <ArrowRight className="transition-transform duration-300 lg:group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </article>
    </div>
  );
}
