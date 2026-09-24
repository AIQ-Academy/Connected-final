import { Lock, TrendingUp } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { scalingPlan } from "@/lib/content";
import { formatCurrency } from "@/lib/utils";

/**
 * Worked example of the doubling rule on a $100,000 allocation. Each rung is
 * exactly twice the one below it until the published $2,000,000 ceiling
 * truncates the final step.
 */
const LADDER_BASE = 100_000;
const CEILING = 2_000_000;

const rungs = [
  { capital: LADDER_BASE, label: "Funded" },
  { capital: 200_000, label: "First scale" },
  { capital: 400_000, label: "Second scale" },
  { capital: 800_000, label: "Third scale" },
  { capital: 1_600_000, label: "Fourth scale" },
  { capital: CEILING, label: "Ceiling" },
] as const;

export function ScalingLadder() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14">
      <div>
        <StaggerGroup className="space-y-3">
          {scalingPlan.map((step, index) => (
            <StaggerItem key={step.milestone}>
              <div className="border-line-soft bg-panel hover:border-brand-light/50 relative flex gap-5 rounded-2xl border p-5 transition-colors sm:p-6">
                <div className="flex flex-col items-center">
                  <span className="border-brand/40 bg-brand/12 text-brand-light grid size-9 shrink-0 place-items-center rounded-full border font-mono text-[0.75rem] font-medium">
                    {index + 1}
                  </span>
                  {index < scalingPlan.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="rail-dotted mt-2 w-px flex-1"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="text-ink font-display text-base font-semibold">
                      {step.milestone}
                    </h3>
                    <Badge tone={index === 0 ? "neutral" : "mint"}>
                      {step.capital}
                    </Badge>
                    <span className="text-faint font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
                      Split {step.split}
                    </span>
                  </div>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {step.note}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal delay={0.1}>
          <div className="border-line-soft bg-sunken/60 mt-6 flex items-start gap-3 rounded-2xl border p-5">
            <Lock className="text-mint mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="text-muted text-sm leading-relaxed">
              A split, once earned, is locked. A losing cycle after a scale-up
              never moves you back down a step — it simply pauses progress until
              the next 10% is banked.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal direction="left">
        <div className="border-line-soft bg-panel overflow-hidden rounded-3xl border">
          <div className="border-line-soft flex items-center gap-2.5 border-b px-6 py-4">
            <TrendingUp className="text-brand-light size-4" aria-hidden="true" />
            <p className="text-ink text-sm font-semibold">
              A {formatCurrency(LADDER_BASE, { decimals: 0 })} account, scaled
            </p>
          </div>

          <ol className="p-6 sm:p-7">
            {rungs.map((rung, index) => {
              const width = 22 + (index / (rungs.length - 1)) * 78;
              const isCeiling = rung.capital === CEILING;

              return (
                <li key={rung.label} className="mb-5 last:mb-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-faint font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
                      {rung.label}
                    </span>
                    <span className="text-ink tabular font-mono text-[0.875rem] font-medium">
                      {formatCurrency(rung.capital, { decimals: 0 })}
                    </span>
                  </div>
                  <div className="bg-sunken mt-2 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className={
                        isCeiling
                          ? "bg-mint h-full rounded-full"
                          : "from-brand to-brand-light h-full rounded-full bg-gradient-to-r"
                      }
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="border-line-soft text-muted border-t px-6 py-5 text-[0.8125rem] leading-relaxed">
            Each rung requires a 10% cumulative return —{" "}
            {formatCurrency(LADDER_BASE * 0.1, { decimals: 0 })} on the first
            step — banked across two consecutive payout cycles. The fifth
            doubling would reach {formatCurrency(3_200_000, { decimals: 0 })}, so
            the allocation stops at the published{" "}
            {formatCurrency(CEILING, { decimals: 0 })} ceiling.
          </div>
        </div>
      </Reveal>
    </div>
  );
}
