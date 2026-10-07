'use client';

import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { HomeProductContent } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { brokerAccountSkins, brokerTierMetaLine } from "@/lib/landing/broker";
import { homeTrading as tradingDefaults } from "@/lib/landing/home";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function HomeTradingSection({
  content,
  image,
}: {
  content?: HomeProductContent;
  image?: ResolvedImage;
} = {}) {
  const { locale, t, formatCurrency } = useLocale();
  // CMS copy overlays the shipped constants; the tier list and anchor id are
  // structural and stay in code.
  const source = { ...tradingDefaults, ...content };
  const pointKeys = [
    ["home.trading.point1.label", "home.trading.point1.detail"],
    ["home.trading.point2.label", "home.trading.point2.detail"],
    ["home.trading.point3.label", "home.trading.point3.detail"],
    ["home.trading.point4.label", "home.trading.point4.detail"],
  ] as const;
  const statKeys = ["home.trading.stat1", "home.trading.stat2", "home.trading.stat3", "home.trading.stat4"] as const;
  const homeTrading = locale === "en" ? source : {
    ...source,
    eyebrow: t("home.trading.eyebrow"), kicker: t("home.trading.kicker"),
    title: t("home.trading.title"), lead: t("home.trading.lead"),
    primary: { ...source.primary, label: t("home.trading.primary") },
    secondary: { ...source.secondary, label: t("home.trading.secondary") },
    tertiary: { ...source.tertiary, label: t("home.trading.tertiary") },
    points: source.points.map((point, index) => ({
      ...point,
      label: t(pointKeys[index]?.[0] ?? "home.trading.point1.label"),
      detail: t(pointKeys[index]?.[1] ?? "home.trading.point1.detail"),
    })),
    stats: source.stats.map((stat, index) => ({
      ...stat,
      label: t(statKeys[index] ?? "home.trading.stat1"),
    })),
  };
  const panel = image ?? marketingImages.homeTrading;

  return (
    <Section
      id={homeTrading.id}
      size="spacious"
      className="scroll-mt-28 isolate overflow-hidden bg-bg"
    >
      <GridBackdrop className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgb(var(--cf-accent-glow)/0.12),transparent_42%),radial-gradient(circle_at_0%_80%,rgb(var(--cf-brand-glow)/0.1),transparent_40%)]"
      />

      <Container className="relative">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="chev bg-mint" />
              {homeTrading.eyebrow}
            </p>
            <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.18em] text-mint uppercase">
              {homeTrading.kicker}
            </p>
            <h2 className="text-h1 mt-3 max-w-3xl">{homeTrading.title}</h2>
            <p className="text-lead text-muted mt-5 max-w-2xl">
              {homeTrading.lead}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={homeTrading.primary.href} size="lg">
              {homeTrading.primary.label}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href={homeTrading.secondary.href}
              variant="soft"
              size="lg"
            >
              {homeTrading.secondary.label}
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-12 lg:items-stretch lg:gap-6">
          <Reveal className="lg:col-span-7">
            <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-line sm:min-h-[28rem] lg:h-full">
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-[center_42%]"
                {...("blurDataURL" in panel && panel.blurDataURL
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: panel.blurDataURL,
                    }
                  : {})}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.88)_0%,rgb(var(--cf-hero-rgb)/0.25)_48%,transparent_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="font-display mt-4 text-2xl font-semibold text-white sm:text-3xl">
                  {locale === "en" ? "Standard, Pro and VIP — one login, three live accounts." : t("home.trading.cardTitle")}
                </p>
                <ButtonLink
                  href={homeTrading.tertiary.href}
                  variant="outline"
                  className="mt-5 border-white/40 bg-white/8 text-white hover:border-white hover:bg-white/15 hover:text-white"
                >
                  {homeTrading.tertiary.label}
                  <ArrowRight />
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {homeTrading.tiers.map((tier) => {
              const meta = locale === "en" ? brokerTierMetaLine(tier) : [
                t(tier.code === "vip" ? "home.accounts.extraTightSpread" : "home.accounts.tightSpread"),
                tier.leverage ? `${t("home.accounts.leverage")} ${tier.leverage}` : undefined,
                tier.commission ? t("home.accounts.noCommission") : undefined,
              ].filter(Boolean).join(" · ");
              const tone = brokerAccountSkins[tier.code as keyof typeof brokerAccountSkins];
              return (
              <StaggerItem key={tier.code}>
                <article
                  className={cn(
                    "relative h-full overflow-hidden rounded-2xl border p-5 shadow-[0_18px_50px_-34px_rgb(0_0_0/0.3)] transition duration-300 hover:-translate-y-0.5 sm:p-6",
                    tone.border,
                    tone.plate,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={cn("font-mono text-[0.625rem] tracking-[0.16em] uppercase", tone.title)}>
                        {tier.name}
                      </p>
                      <p className="font-display mt-1.5 text-2xl font-semibold text-slate-950">
                        {formatCurrency(tier.minDeposit)}
                        <span className={cn("ms-2 font-sans text-sm font-normal", tone.detail)}>
                          {locale === "en" ? "min" : t("home.trading.minimum")}
                        </span>
                      </p>
                    </div>
                    {tier.isFeatured && (
                      <span className={cn("rounded-full border px-2 py-[3px] font-mono text-[0.5625rem] tracking-[0.14em] text-slate-900 uppercase", tone.border)}>
                        {locale === "en" ? "Popular" : t("home.trading.popular")}
                      </span>
                    )}
                  </div>
                  {meta ? (
                    <p className={cn("mt-3 font-mono text-[0.6875rem]", tone.detail)}>
                      {meta}
                    </p>
                  ) : null}
                </article>
              </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>

        <Reveal delay={0.08}>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeTrading.points.map((point) => (
              <li
                key={point.label}
                className="rounded-2xl border border-line bg-panel p-5 sm:p-6"
              >
                <p className="font-display text-base font-semibold text-ink">
                  {point.label}
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {point.detail}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {homeTrading.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-raised px-5 py-7 sm:px-7 sm:py-8"
              >
                <dt className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display tabular mt-3 text-3xl font-semibold text-ink sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
