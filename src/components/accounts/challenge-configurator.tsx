"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { AccountTier } from "@/db/schema";
import { challengeAddOns, platforms } from "@/lib/content";
import { signupUrl } from "@/lib/site";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * The pricing surface for /accounts. Every figure in the summary is derived
 * from the selected tier and the add-ons that are actually applied, so the
 * panel can never quote a rule the checkout would not honour.
 */

/** Add-on fees are rounded to the dollar so no line ever shows cents. */
function addOnFee(basePrice: number, multiplier: number) {
  return Math.round(basePrice * multiplier);
}

/** Illustrative return used for the payout estimate at the foot of the panel. */
const ILLUSTRATIVE_MONTHLY_RETURN = 0.05;

function useAnimatedNumber(value: number, duration = 0.55) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(current.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (next) => {
        current.current = next;
        setDisplay(next);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);

  // Reduced motion snaps to the target by deriving it, which keeps the effect
  // free of a synchronous state write.
  return reduced ? value : display;
}

function AnimatedMoney({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const display = useAnimatedNumber(value);
  return (
    <span className={cn("tabular", className)}>
      {formatCurrency(Math.round(display), { decimals: 0 })}
    </span>
  );
}

function AnimatedInteger({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const display = useAnimatedNumber(value);
  return (
    <span className={cn("tabular", className)}>
      {Math.round(display)}
      {suffix}
    </span>
  );
}

export function ChallengeConfigurator({ tiers }: { tiers: AccountTier[] }) {
  const [tierIndex, setTierIndex] = useState(() => {
    const featured = tiers.findIndex((tier) => tier.isFeatured);
    return featured >= 0 ? featured : 0;
  });
  const [platformSlug, setPlatformSlug] = useState(platforms[0].slug);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const tier = tiers[tierIndex];
  const platform = platforms.find((p) => p.slug === platformSlug) ?? platforms[0];

  const config = useMemo(() => {
    const active = new Set(selectedAddOns);

    // Add-on effects are applied here rather than described in copy, so the
    // summary and the rulebook can never drift apart.
    const phase1Pct = active.has("drawdown-8")
      ? tier.phase1TargetPct - 2
      : tier.phase1TargetPct;
    const overallPct = active.has("drawdown-8")
      ? 8
      : tier.maxOverallDrawdownPct;
    const splitPct = active.has("split-90")
      ? 90
      : tier.profitSplitPct;
    const payoutFrequency = active.has("payout-weekly")
      ? "weekly"
      : tier.payoutFrequency;
    const minTradingDays = active.has("no-min-days") ? 0 : tier.minTradingDays;

    const addOnTotal = challengeAddOns
      .filter((addOn) => active.has(addOn.code))
      .reduce((sum, addOn) => sum + addOnFee(tier.price, addOn.priceMultiplier), 0);

    return {
      phase1Pct,
      phase2Pct: tier.phase2TargetPct,
      dailyPct: tier.maxDailyDrawdownPct,
      overallPct,
      splitPct,
      payoutFrequency,
      minTradingDays,
      total: tier.price + addOnTotal,
      phase1Amount: (tier.accountSize * phase1Pct) / 100,
      phase2Amount: (tier.accountSize * tier.phase2TargetPct) / 100,
      dailyAmount: (tier.accountSize * tier.maxDailyDrawdownPct) / 100,
      overallAmount: (tier.accountSize * overallPct) / 100,
      monthlyPayout:
        tier.accountSize * ILLUSTRATIVE_MONTHLY_RETURN * (splitPct / 100),
    };
  }, [tier, selectedAddOns]);

  function toggleAddOn(code: string) {
    setSelectedAddOns((current) =>
      current.includes(code)
        ? current.filter((value) => value !== code)
        : [...current, code],
    );
  }

  const sliderProgress =
    tiers.length > 1 ? (tierIndex / (tiers.length - 1)) * 100 : 0;

  return (
    <div className="border-line-soft bg-panel scanline relative overflow-hidden rounded-3xl border">
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* ---- Controls ---- */}
        <div className="border-line-soft space-y-10 border-b p-6 sm:p-8 lg:border-r lg:border-b-0 lg:p-10">
          <fieldset>
            <legend className="text-ink font-display text-base font-semibold">
              1 · Account size
            </legend>
            <p className="text-muted mt-1.5 text-sm">
              Every tier runs the same rulebook. Capital and the profit split
              are the only variables.
            </p>

            <div className="mt-7">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-ink font-display text-3xl font-semibold sm:text-4xl">
                    <AnimatedMoney value={tier.accountSize} />
                  </span>
                  <span className="text-faint mt-1 block font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                    {tier.name} tier
                  </span>
                </div>
                {tier.isFeatured && (
                  <Badge tone="brand" size="md">
                    Most popular
                  </Badge>
                )}
              </div>

              <input
                type="range"
                min={0}
                max={tiers.length - 1}
                step={1}
                value={tierIndex}
                onChange={(event) => setTierIndex(Number(event.target.value))}
                className="cf-range"
                style={
                  { "--range-progress": `${sliderProgress}%` } as CSSProperties
                }
                aria-label="Account size"
                aria-valuetext={`${tier.name}, ${formatCurrency(tier.accountSize, { decimals: 0 })}`}
              />

              <div className="mt-4 grid grid-cols-5 gap-1">
                {tiers.map((option, index) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setTierIndex(index)}
                    aria-pressed={index === tierIndex}
                    className={cn(
                      "rounded-lg px-1 py-1.5 font-mono text-[0.6875rem] tracking-tight transition-colors",
                      index === tierIndex
                        ? "text-brand-light bg-brand/10"
                        : "text-faint hover:text-ink",
                    )}
                  >
                    ${option.accountSize / 1000}K
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-ink font-display text-base font-semibold">
              2 · Platform
            </legend>
            <p className="text-muted mt-1.5 text-sm">
              All three connect to the same funded account, and you can switch
              at any point during the evaluation.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {platforms.map((option) => {
                const selected = option.slug === platformSlug;
                return (
                  <label
                    key={option.slug}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border p-3.5 transition-colors",
                      selected
                        ? "border-brand bg-brand/10"
                        : "border-line hover:border-brand-light/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="cf-platform"
                      value={option.slug}
                      checked={selected}
                      onChange={() => setPlatformSlug(option.slug)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "block text-[0.8125rem] font-semibold",
                        selected ? "text-ink" : "text-muted group-hover:text-ink",
                      )}
                    >
                      {option.name}
                    </span>
                    <span className="text-faint mt-0.5 block text-xs">
                      {option.tagline}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-ink font-display text-base font-semibold">
              3 · Add-ons
            </legend>
            <p className="text-muted mt-1.5 text-sm">
              Optional. Each one changes a published rule and is priced as a
              fraction of the evaluation fee.
            </p>

            <div className="mt-5 space-y-2.5">
              {challengeAddOns.map((addOn) => {
                const selected = selectedAddOns.includes(addOn.code);
                const fee = addOnFee(tier.price, addOn.priceMultiplier);

                return (
                  <label
                    key={addOn.code}
                    className={cn(
                      "flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors",
                      selected
                        ? "border-brand bg-brand/10"
                        : "border-line hover:border-brand-light/60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAddOn(addOn.code)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                        selected
                          ? "border-brand bg-brand text-white"
                          : "border-line",
                      )}
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-ink text-[0.875rem] font-semibold">
                          {addOn.name}
                        </span>
                        <span className="text-brand-light tabular font-mono text-[0.8125rem]">
                          +{formatCurrency(fee, { decimals: 0 })}
                        </span>
                      </span>
                      <span className="text-muted mt-1 block text-[0.8125rem] leading-relaxed">
                        {addOn.description}
                      </span>
                      <span className="text-faint mt-2 block font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
                        {addOn.effect}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* ---- Live summary ---- */}
        <div className="bg-sunken/60 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">
              <span className="chev" />
              Your configuration
            </span>
            <span className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              {platform.name}
            </span>
          </div>

          <p className="text-ink font-display mt-5 text-4xl leading-none font-semibold sm:text-5xl">
            <AnimatedMoney value={config.total} />
          </p>
          <p className="text-muted mt-2 text-sm">
            One-time evaluation fee, refunded in full with your first payout.
          </p>

          <dl className="border-line-soft mt-8 space-y-0 border-t">
            <SummaryRow label="Phase 1 target">
              <AnimatedInteger value={config.phase1Pct} suffix="%" />
              <Secondary>
                <AnimatedMoney value={config.phase1Amount} />
              </Secondary>
            </SummaryRow>
            <SummaryRow label="Phase 2 target">
              <AnimatedInteger value={config.phase2Pct} suffix="%" />
              <Secondary>
                <AnimatedMoney value={config.phase2Amount} />
              </Secondary>
            </SummaryRow>
            <SummaryRow label="Max daily drawdown">
              <AnimatedInteger value={config.dailyPct} suffix="%" />
              <Secondary>
                <AnimatedMoney value={config.dailyAmount} />
              </Secondary>
            </SummaryRow>
            <SummaryRow label="Max overall drawdown">
              <AnimatedInteger value={config.overallPct} suffix="%" />
              <Secondary>
                <AnimatedMoney value={config.overallAmount} />
              </Secondary>
            </SummaryRow>
            <SummaryRow label="Minimum trading days">
              <AnimatedInteger value={config.minTradingDays} />
            </SummaryRow>
            <SummaryRow label="Profit split" tone="mint">
              <AnimatedInteger value={config.splitPct} suffix="%" />
            </SummaryRow>
            <SummaryRow label="Payout cycle">
              <span className="capitalize">{config.payoutFrequency}</span>
            </SummaryRow>
            <SummaryRow label="Max leverage">
              <span>{tier.maxLeverage}</span>
            </SummaryRow>
          </dl>

          <div className="border-brand/30 bg-brand/10 mt-7 rounded-2xl border p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="text-brand-light size-4" aria-hidden="true" />
              <p className="text-brand-light font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                Illustrative payout
              </p>
            </div>
            <p className="text-ink font-display mt-3 text-3xl font-semibold">
              <AnimatedMoney value={config.monthlyPayout} />
            </p>
            <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">
              What a 5% monthly return on{" "}
              {formatCurrency(tier.accountSize, { decimals: 0 })} pays you at a{" "}
              {config.splitPct}% split. An illustration of the arithmetic, not a
              projection of performance.
            </p>
          </div>

          <ButtonLink href={signupUrl} size="lg" block className="mt-7">
            Start this evaluation
            <ArrowRight />
          </ButtonLink>
          <p className="text-faint mt-3 text-center font-mono text-[0.6875rem]">
            {tier.name} · {platform.name} ·{" "}
            {selectedAddOns.length === 0
              ? "no add-ons"
              : `${selectedAddOns.length} add-on${selectedAddOns.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "mint";
  children: React.ReactNode;
}) {
  return (
    <div className="border-line-soft flex items-baseline justify-between gap-4 border-b py-3">
      <dt className="text-muted text-[0.8125rem]">{label}</dt>
      <dd
        className={cn(
          "flex items-baseline gap-2.5 font-mono text-[0.875rem] font-medium",
          tone === "mint" ? "text-mint" : "text-ink",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function Secondary({ children }: { children: React.ReactNode }) {
  return <span className="text-faint text-[0.75rem]">{children}</span>;
}
