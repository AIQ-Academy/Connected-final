"use client";

import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Tone = "buy" | "sell";

const sharedSteps = [
  {
    title: "Select the instrument",
    buy: "Choose the market you want to trade from the product list or your platform Market Watch.",
    sell: "Open the same product you intend to sell or short from the product list or platform.",
  },
  {
    title: "Set volume",
    buy: "Enter lot size in the increments allowed for that instrument. Smaller size means lower exposure.",
    sell: "Enter the lot size that matches your risk plan for a short or closing sell.",
  },
  {
    title: "Review estimated margin",
    buy: "Check the margin required at the published leverage before you send the order.",
    sell: "Confirm the margin impact at the instrument’s leverage before sending the order.",
  },
  {
    title: "Confirm leverage & risk controls",
    buy: "Verify the leverage applied, then set stop-loss and take-profit levels if you use them.",
    sell: "Double-check the leverage applied and set stop-loss and take-profit where appropriate.",
  },
] as const;

const confirmStep = {
  buy: {
    title: "Confirm the buy order",
    body: "Submit a market or pending buy. The fill reflects the current ask and available liquidity.",
  },
  sell: {
    title: "Confirm the sell order",
    body: "Submit a market or pending sell. The fill reflects the current bid and available liquidity.",
  },
} as const;

const closeStep = {
  title: "Monitor and close",
  buy: "Track floating P/L, margin level and exposure, then close when your plan says to exit.",
  sell: "Watch the position, manage risk, and close when your plan says to exit.",
} as const;

const intros: Record<Tone, string> = {
  buy: "A buy opens a long position when you expect the quoted price to rise. The ticket walks the same checks before anything is sent.",
  sell: "A sell opens a short position when you expect the quoted price to fall. The ticket shows the same margin, leverage and risk controls before you confirm.",
};

/**
 * Buy / Sell walkthrough — one sequence, toggle the direction.
 * Shared checks stay visible; only the confirm step changes with the rail.
 */
export function BuySellSteps() {
  const [tone, setTone] = useState<Tone>("buy");

  const steps = [
    ...sharedSteps.map((step) => ({
      title: step.title,
      body: step[tone],
    })),
    confirmStep[tone],
    { title: closeStep.title, body: closeStep[tone] },
  ];

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Buy / Sell experience"
        title="Long and short follow the same path."
        lead="Whether you expect the price to rise or fall, the order ticket walks through the same checks before anything is sent — instrument, size, margin, leverage and risk controls."
      />

      <Reveal>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
          <div className="lg:w-72 lg:shrink-0">
            <div
              role="tablist"
              aria-label="Order direction"
              className="border-line-soft bg-panel inline-flex rounded-xl border p-1"
            >
              <DirectionTab
                active={tone === "buy"}
                tone="buy"
                onClick={() => setTone("buy")}
              >
                Buy
              </DirectionTab>
              <DirectionTab
                active={tone === "sell"}
                tone="sell"
                onClick={() => setTone("sell")}
              >
                Sell
              </DirectionTab>
            </div>

            <p className="text-muted mt-5 max-w-sm text-sm leading-relaxed">
              {intros[tone]}
            </p>
            <p className="text-faint mt-4 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
              {steps.length} steps · same ticket
            </p>
          </div>

          <ol
            key={tone}
            className="border-line-soft bg-panel divide-line-soft min-w-0 flex-1 divide-y overflow-hidden rounded-2xl border"
          >
            {steps.map((step, index) => (
              <li
                key={`${tone}-${step.title}`}
                className="flex gap-4 p-5 sm:gap-5 sm:p-6"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg border font-display text-sm font-semibold",
                    tone === "buy"
                      ? "border-mint/30 bg-mint/10 text-mint"
                      : "border-brand/35 bg-brand/10 text-brand-light",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-ink font-display text-base font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}

function DirectionTab({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: Tone;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "min-w-[5.5rem] rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
        active &&
          tone === "buy" &&
          "bg-mint/15 text-mint",
        active &&
          tone === "sell" &&
          "bg-brand/15 text-brand-light",
        !active && "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
