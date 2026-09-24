"use client";

import { ArrowRight } from "lucide-react";
import { useState, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/button";
import { signupUrl } from "@/lib/site";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

export type HeroTierOption = {
  code: string;
  name: string;
  accountSize: number;
  price: number;
  profitSplitPct: number;
  isFeatured: boolean;
};

/**
 * Compact challenge calculator for the hero — size slider, live fee / split,
 * and a portal signup CTA. Wrapped in `swiper-no-swiping` by the parent so
 * range drags do not steal the carousel.
 */
export function HeroCalculator({ tiers }: { tiers: HeroTierOption[] }) {
  const [tierIndex, setTierIndex] = useState(() => {
    const featured = tiers.findIndex((tier) => tier.isFeatured);
    return featured >= 0
      ? featured
      : Math.min(1, Math.max(0, tiers.length - 1));
  });

  const tier = tiers[Math.min(tierIndex, Math.max(0, tiers.length - 1))];

  if (!tier) return null;

  const progress =
    tiers.length > 1 ? (tierIndex / (tiers.length - 1)) * 100 : 0;

  const readout = [
    {
      label: "Evaluation fee",
      shortLabel: "Fee",
      value: formatCurrency(tier.price, { decimals: 0 }),
    },
    { label: "Profit split", shortLabel: "Split", value: `${tier.profitSplitPct}%` },
    { label: "Commission", shortLabel: "Comm.", value: "0%" },
  ];

  return (
    <div className="swiper-no-swiping w-full max-w-md rounded-2xl border border-white/30 bg-white/[0.1] p-5 backdrop-blur-[6px] sm:bg-white/[0.08] sm:p-7 sm:backdrop-blur-none">
      <div className="flex items-center justify-between gap-4 border-b border-white/25 pb-4">
        <span className="font-mono text-[0.625rem] tracking-[0.2em] text-white/70 uppercase">
          Account size
        </span>
        <span className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
          {tier.name}
          {tier.isFeatured && (
            <>
              <span aria-hidden="true" className="h-px w-3 bg-white/40" />
              Most chosen
            </>
          )}
        </span>
      </div>

      <p className="tabular font-display mt-5 text-[2.35rem] leading-none font-semibold text-white sm:mt-6 sm:text-[2.75rem]">
        {formatCompactCurrency(tier.accountSize)}
      </p>

      <input
        type="range"
        min={0}
        max={Math.max(0, tiers.length - 1)}
        step={1}
        value={tierIndex}
        onChange={(event) => setTierIndex(Number(event.target.value))}
        className="cf-range mt-7"
        style={{ "--range-progress": `${progress}%` } as CSSProperties}
        aria-label="Account size"
        aria-valuetext={`${tier.name}, ${formatCurrency(tier.accountSize, { decimals: 0 })}`}
      />

      <div className="mt-5 flex overflow-hidden rounded-lg border border-white/25">
        {tiers.map((option, index) => (
          <button
            key={option.code}
            type="button"
            onClick={() => setTierIndex(index)}
            aria-pressed={index === tierIndex}
            className={cn(
              "tabular min-w-0 flex-1 border-l border-white/20 py-2 font-mono text-[0.6875rem] tracking-[0.06em] transition-colors duration-200 outline-none first:border-l-0 focus-visible:bg-white/10 focus-visible:text-white",
              index === tierIndex
                ? "bg-white/16 text-white"
                : "text-white/65 hover:bg-white/[0.08] hover:text-white/90",
            )}
          >
            {formatCompactCurrency(option.accountSize)}
          </button>
        ))}
      </div>

      <dl className="mt-7 grid grid-cols-3 border-t border-white/25 pt-5">
        {readout.map((row) => (
          <div
            key={row.label}
            className="border-l border-white/20 pl-4 first:border-l-0 first:pl-0"
          >
            <dt className="font-mono text-[0.5625rem] leading-tight tracking-[0.16em] text-white/65 uppercase">
              <span className="sm:hidden">{row.shortLabel}</span>
              <span className="hidden sm:inline">{row.label}</span>
            </dt>
            <dd className="tabular font-display mt-2 text-xl leading-none font-semibold text-white">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <ButtonLink
        href={signupUrl}
        size="lg"
        className="mt-7 w-full border-0 bg-brand text-white shadow-none hover:bg-brand-light"
      >
        Create account
        <ArrowRight />
      </ButtonLink>
      <p className="mt-3.5 text-center font-mono text-[0.625rem] tracking-[0.1em] text-white/60 uppercase">
        Fee refunded with your first payout
      </p>
    </div>
  );
}

/** Three headline funding types for the middle hero screen. */
export function headlineFundingTiers(
  tiers: HeroTierOption[],
): HeroTierOption[] {
  if (tiers.length <= 3) return tiers;
  const sorted = [...tiers].sort((a, b) => a.accountSize - b.accountSize);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const middle =
    sorted.find((tier) => tier.isFeatured && tier !== first && tier !== last) ??
    sorted[Math.floor(sorted.length / 2)]!;
  return [first, middle, last];
}
