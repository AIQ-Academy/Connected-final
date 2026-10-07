import { ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { AccountTier } from "@/db/schema";
import type { HomeProductContent } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { homeFunded as fundedDefaults } from "@/lib/landing/home";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

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
 * The ladder is one row of equal columns, so it has to know how many it got.
 * It only splits at `md`: three columns on a 640px screen leaves the amounts
 * too little room to stay on one line.
 */
const ladderColumns: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

const outlineOnDark =
  "border-white/45 bg-transparent text-white hover:border-white hover:bg-white/8 hover:text-white";

/** Shared cool accent keeps the adjoining dark sections visually consistent. */
const ACCENT = "#8fb4ff";

export function HomeFundedSection({
  tiers,
  content,
  image,
}: {
  tiers: AccountTier[];
  content?: HomeProductContent;
  image?: ResolvedImage;
}) {
  const homeFunded = { ...fundedDefaults, ...content };
  const panel = image ?? marketingImages.homeFunded;
  const selection = headlineTiers(tiers);

  return (
    <Section
      id={homeFunded.id}
      size="spacious"
      className="scroll-mt-28 overflow-hidden bg-[#080b14] text-white"
    >
      <Container className="relative">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-white/75">
              <span className="chev" style={{ background: ACCENT }} />
              {homeFunded.eyebrow}
            </p>
            <p
              className="mt-5 font-mono text-[0.8125rem] tracking-[0.2em] uppercase"
              style={{ color: ACCENT }}
            >
              {homeFunded.kicker}
            </p>
            <h2 className="text-h1 mt-3 max-w-3xl text-white">
              {homeFunded.title}
            </h2>
            <p className="text-lead mt-5 max-w-2xl text-white/80">
              {homeFunded.lead}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={homeFunded.primary.href} size="lg">
              {homeFunded.primary.label}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href={homeFunded.secondary.href}
              variant="outline"
              size="lg"
              className={outlineOnDark}
            >
              {homeFunded.secondary.label}
            </ButtonLink>
          </Reveal>
        </div>

        {/* The allocation ladder. One bordered row of hairline-divided columns
            so every tier is the same height as its neighbours without any of
            them stretching past its own content. */}
        {selection.length > 0 && (
          <Reveal
            className={cn(
              "mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/16 bg-white/12 lg:mt-20",
              ladderColumns[selection.length] ?? "md:grid-cols-3",
            )}
          >
            {selection.map((tier) => (
              <div
                key={tier.code}
                className={cn(
                  "relative bg-[#080b14] px-6 py-8 sm:px-8 sm:py-10",
                  tier.isFeatured && "bg-[#0e1322]",
                )}
              >
                {tier.isFeatured && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: ACCENT }}
                  />
                )}

                {/* Fixed row height keeps the three amounts on one baseline
                    even though only the featured tier carries a pill. */}
                <div className="flex min-h-8 items-center justify-between gap-3">
                  <p className="font-mono text-[0.75rem] tracking-[0.18em] text-white/75 uppercase">
                    {tier.name}
                  </p>
                  {tier.isFeatured && (
                    <span
                      className="rounded-full border px-2.5 py-1 font-mono text-[0.75rem] tracking-[0.1em] text-white uppercase"
                      style={{
                        borderColor: `${ACCENT}8c`,
                        background: `${ACCENT}24`,
                      }}
                    >
                      Most chosen
                    </span>
                  )}
                </div>

                <p className="font-display tabular mt-6 text-[2.75rem] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[3.25rem]">
                  {formatCompactCurrency(tier.accountSize)}
                </p>
                <p className="mt-2.5 text-[0.9375rem] text-white/65">
                  allocation
                </p>

                <dl className="mt-7 space-y-3.5 border-t border-white/12 pt-6 text-[0.9375rem]">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-white/65">fee</dt>
                    <dd className="tabular font-medium text-white">
                      {formatCurrency(tier.price, { decimals: 0 })}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-white/65">split</dt>
                    <dd className="tabular font-medium text-white">
                      {tier.profitSplitPct}%
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-white/65">targets</dt>
                    <dd className="tabular font-medium text-white">
                      {tier.phase1TargetPct}% → {tier.phase2TargetPct}%
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-white/65">daily DD</dt>
                    <dd className="tabular font-medium text-white">
                      {tier.maxDailyDrawdownPct}%
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </Reveal>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
          <Reveal className="lg:col-span-7">
            <figure className="relative h-full min-h-[21rem] overflow-hidden rounded-3xl border border-white/10 sm:min-h-[26rem]">
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                unoptimized={panel.src.startsWith("/")}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-[center_40%]"
                {...("blurDataURL" in panel && panel.blurDataURL
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: panel.blurDataURL,
                    }
                  : {})}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(6_7_14/0.94)_0%,rgb(6_7_14/0.5)_44%,transparent_100%)]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span
                  className="inline-flex size-11 items-center justify-center rounded-xl border"
                  style={{
                    background: `${ACCENT}22`,
                    borderColor: `${ACCENT}47`,
                    color: ACCENT,
                  }}
                >
                  <TrendingUp className="size-5" aria-hidden />
                </span>
                <p className="font-display mt-5 max-w-lg text-[1.5rem] leading-[1.15] font-semibold text-white sm:text-[2rem]">
                  Five tiers, one rulebook. Scale is the only variable.
                </p>
                <ButtonLink
                  href={homeFunded.tertiary.href}
                  variant="outline"
                  className={cn(outlineOnDark, "mt-6")}
                >
                  {homeFunded.tertiary.label}
                  <ArrowRight />
                </ButtonLink>
              </figcaption>
            </figure>
          </Reveal>

          {/* The four rulebook points read as a list against the photograph
              rather than four more cards competing with the ladder. */}
          <Reveal delay={0.08} className="lg:col-span-5">
            <ul className="flex h-full flex-col justify-center divide-y divide-white/12 rounded-3xl border border-white/16 px-6 sm:px-8">
              {homeFunded.points.map((point) => (
                <li key={point.label} className="py-5 sm:py-6">
                  <p className="font-display text-[1.0625rem] font-semibold text-white sm:text-[1.125rem]">
                    {point.label}
                  </p>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-white/72">
                    {point.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/16 bg-white/12 lg:grid-cols-4">
            {homeFunded.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#080b14] px-5 py-7 sm:px-8 sm:py-9"
              >
                <dt className="font-mono text-[0.75rem] tracking-[0.16em] text-white/68 uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display tabular mt-3.5 text-[1.625rem] leading-none font-semibold tracking-[-0.02em] text-white sm:text-[2.25rem]">
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
