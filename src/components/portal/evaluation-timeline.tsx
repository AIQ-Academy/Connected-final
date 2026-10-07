import { Check, Circle, Minus } from "lucide-react";

import type { TradingAccount } from "@/db/schema";
import { formatDate, relativeTime } from "@/lib/trading";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  blurb: string;
  at: Date | null;
  terminal?: boolean;
};

/**
 * The account's journey from first evaluation trade to funded capital, driven
 * entirely by the timestamps on the row. The first step without a date is the
 * one in progress — unless the account was breached, in which case nothing
 * after the breach is reachable.
 */
export function EvaluationTimeline({ account }: { account: TradingAccount }) {
  const failed = Boolean(account.failedAt);

  const steps: Step[] = [
    {
      title: "Phase 1 started",
      blurb: "First evaluation order placed on the account.",
      at: account.phase1StartedAt,
    },
    {
      title: "Phase 1 passed",
      blurb: "Profit target reached inside the drawdown limits.",
      at: account.phase1PassedAt,
    },
    {
      title: "Phase 2 started",
      blurb: "Verification phase opened on the same balance.",
      at: account.phase2StartedAt,
    },
    {
      title: "Phase 2 passed",
      blurb: "Consistency confirmed and the account cleared for funding.",
      at: account.phase2PassedAt,
    },
    {
      title: "Funded",
      blurb: "Live capital allocated and the profit split activated.",
      at: account.fundedAt,
    },
  ];

  if (failed) {
    steps.push({
      title: "Account breached",
      blurb: "A risk limit was hit and trading was stopped.",
      at: account.failedAt,
      terminal: true,
    });
  }

  const currentIndex = failed ? -1 : steps.findIndex((step) => !step.at);

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const state: "complete" | "current" | "upcoming" = step.at
          ? "complete"
          : index === currentIndex
            ? "current"
            : "upcoming";
        const isLast = index === steps.length - 1;
        const breach = Boolean(step.terminal);

        return (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-7 bottom-0 start-[0.6875rem] w-px",
                  state === "complete" && !breach ? "bg-mint/45" : "bg-line",
                )}
              />
            )}

            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border",
                breach && "border-loss/50 bg-loss/15 text-loss",
                !breach && state === "complete" && "border-mint/50 bg-mint/15 text-mint",
                !breach && state === "current" && "border-brand bg-brand text-white",
                !breach && state === "upcoming" && "border-line bg-panel text-faint",
              )}
            >
              {state === "complete" ? (
                breach ? (
                  <Minus className="size-3" />
                ) : (
                  <Check className="size-3" />
                )
              ) : state === "current" ? (
                <Circle className="size-2 fill-current" />
              ) : (
                <Circle className="size-2" />
              )}
            </span>

            <div className="-mt-0.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <p
                  className={cn(
                    "text-[0.875rem] font-medium",
                    state === "upcoming" && "text-faint",
                    breach && "text-loss",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "tabular text-[0.78125rem]",
                    step.at ? "text-muted" : "text-faint",
                  )}
                >
                  {step.at
                    ? formatDate(step.at)
                    : state === "current"
                      ? "In progress"
                      : "Not reached"}
                </p>
              </div>
              <p className="text-faint mt-0.5 text-[0.78125rem]">
                {step.blurb}
                {step.at && (
                  <span className="text-faint"> · {relativeTime(step.at)}</span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
