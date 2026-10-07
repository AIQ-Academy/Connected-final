"use client";

import { ArrowRight, Check, Crown, Gem, ShieldCheck } from "lucide-react";

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
  brokerAccountSkins,
  type BrokerAccountTier,
} from "@/lib/landing/broker";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function BrokerAccountTypesSection({
  heading = brokerAccountTypesHeading,
}: {
  heading?: Heading;
} = {}) {
  const { t, locale } = useLocale();
  const localizedHeading = locale === "en" ? heading : {
    ...heading,
    title: t("home.accounts.title"),
    lead: t("home.accounts.lead"),
    actionLabel: t("home.accounts.compare"),
  };
  return (
    <Section id="account-types" size="spacious" className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_10%_0%,color-mix(in_oklab,var(--cf-mint)_8%,transparent),transparent_70%)]"
      />
      <Container className="relative">
        <SectionHeading
          eyebrow={locale === "en" ? heading.eyebrow : t("home.accounts.eyebrow")}
          title={localizedHeading.title}
          lead={localizedHeading.lead}
          action={
            <ButtonLink href={localizedHeading.actionHref} variant="outline">
              {localizedHeading.actionLabel}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase lg:hidden">
            {t("home.accounts.swipe")}
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
                className={cn(
                  "mobile-snap-card h-full w-[min(88vw,22rem)] lg:w-auto",
                  tier.isFeatured && "relative lg:-top-3",
                )}
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
  const { t, locale, formatCurrency: localCurrency } = useLocale();
  const featured = tier.isFeatured;
  const total = brokerAccountTiers.length;
  const rank =
    brokerAccountTiers.findIndex((item) => item.code === tier.code) + 1;
  const spreadFigure = tier.spreadFrom?.split(" ")[0];
  const numericSpread = Boolean(spreadFigure && /^\d/.test(spreadFigure));
  const skin = brokerAccountSkins[tier.code as keyof typeof brokerAccountSkins];
  const TierIcon = tier.code === "vip" ? Crown : tier.code === "pro" ? Gem : ShieldCheck;

  return (
    /* Hairline gradient frame: a 1px padded wrapper reads as a lit edge on the
       featured account without the flat ring a plain border colour gives. */
    <div
      data-featured={featured ? true : undefined}
      data-tier={tier.code}
      className={cn("cf-interactive-card account-type-card group relative h-full rounded-[2rem] p-px", skin.frame, skin.border)}
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1px)] bg-raised",
          featured &&
            "shadow-[0_32px_80px_-48px_rgb(var(--cf-brand-glow)/0.85)]",
        )}
      >
        {featured ? (
          <span
            aria-hidden
            className="account-card-featured-idle pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,var(--cf-brand-light),transparent)]"
          />
        ) : null}
        {/* Deposit sits on its own tinted plate so the eye lands on the
            number before the benefits underneath. Spread is a side stat only
            when the spec actually published one. */}
        <div
          className={cn(
            "account-tier-plate border-line-soft relative border-b p-6 transition-colors duration-300 sm:p-7",
            skin.plate,
          )}
        >
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={cn("account-tier-icon grid size-11 shrink-0 place-items-center rounded-2xl border", `account-tier-icon-${tier.code}`)} aria-hidden="true">
                <TierIcon className="size-5" strokeWidth={1.7} />
              </span>
              <div>
                <h3 className={cn("font-display text-xl font-semibold", skin.title)}>
                  {tier.name}
                </h3>
                <p className={cn("mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase", skin.detail)}>
                  {tier.leverage ? `${t("home.accounts.leverage")} ${tier.leverage}` : "\u00a0"}
                </p>
              </div>
            </div>
            {featured ? <Badge tone="neutral" className="border-brand/25 bg-brand-dim/70 text-ink">{t("home.accounts.mostChosen")}</Badge> : null}
          </header>

          <div
            className={cn(
              "mt-7 grid items-end gap-4",
              spreadFigure && numericSpread ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1",
            )}
          >
            <div>
              <p className="account-price font-display tabular text-white text-[2.75rem] leading-none font-semibold tracking-tight">
                {localCurrency(tier.minDeposit)}
              </p>
              <p className={cn("mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase", skin.detail)}>
                {t("home.accounts.minimum")}
              </p>
            </div>
            {spreadFigure ? (
              <div className="text-end">
                <p className={cn("tabular font-mono text-2xl leading-none font-semibold", skin.spread, !numericSpread && "text-start")}>
                  {tier.code === "vip" ? t("home.accounts.extraTightSpread") : t("home.accounts.tightSpread")}
                </p>
                <p className={cn("mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase", skin.detail)}>
                  {numericSpread ? t("home.accounts.spreadFrom") : t("home.accounts.spreadType")}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-auto pt-6">
            <div className={cn("flex items-baseline justify-between font-mono text-[0.625rem] tracking-[0.14em] uppercase", skin.detail)}>
              <span>{t("home.accounts.depositTier")}</span>
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
            {tier.features.map((feature, index) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check
                  className={cn("mt-0.5 size-3.5 shrink-0", skin.check)}
                  aria-hidden
                />
                <span className="text-ink text-sm leading-snug">{locale === "en" ? feature : t(`home.accounts.feature${tier.code === "standard" ? index + 1 : tier.code === "pro" ? index + 3 : index + 7}` as Parameters<typeof t>[0])}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <ButtonLink
              href={signupUrl}
              variant={featured ? "primary" : "soft"}
              block
            >
              {t("home.accounts.open").replace("{account}", tier.name)}
              <ArrowRight className="transition-transform duration-300 lg:group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </article>
    </div>
  );
}
