import { CheckCircle2, Loader2, Target } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MilestoneStatus = "shipped" | "building" | "next";

type Milestone = {
  title: string;
  status: MilestoneStatus;
  body: string;
  detail: string[];
};

/**
 * Capability milestones rather than dated press events: what the platform can
 * do today, what is being built, and what is queued behind it.
 */
const milestones: Milestone[] = [
  {
    title: "One spec sheet, published in full",
    status: "shipped",
    body: "Spread, tick size, price precision, leverage cap, margin and session hours for every instrument on the book — online before you deposit rather than disclosed after.",
    detail: [
      "Typical spreads stated per symbol, not per marketing page",
      "No hidden markup, no administrative widening around news",
    ],
  },
  {
    title: "Execution measured at the engine",
    status: "shipped",
    body: "Median order-to-fill latency and fill rate are measured at the matching engine in Equinix LD4 and published, rather than described with an adjective.",
    detail: [
      "Aggregated tier-1 bank and non-bank liquidity",
      "Larger tickets walk a real book instead of a single provider",
    ],
  },
  {
    title: "Every asset class from one login",
    status: "shipped",
    body: "Forex, precious metals, energies, global indices, share CFDs and major cryptocurrencies on a single balance, with no per-class permission to request.",
    detail: [
      "Leverage set per class, from 1:100 on forex to 1:5 on crypto",
      "MetaTrader 5, cTrader and the Web Terminal share one account",
    ],
  },
  {
    title: "Funding rails that settle in days, not weeks",
    status: "shipped",
    body: "Eight deposit and withdrawal methods across cards, bank transfer, e-wallets and crypto, with the processing fee absorbed on every one of them.",
    detail: [
      "Card and crypto deposits credit instantly",
      "Withdrawals reviewed within one business day",
    ],
  },
  {
    title: "Negative balance protection as standard",
    status: "shipped",
    body: "Retail accounts cannot go below zero. A weekend gap that takes an account negative is reset at our expense rather than invoiced to the trader.",
    detail: [
      "Margin call at 100%, stop-out at the 5% loss limit",
      "Client money held in segregated accounts",
    ],
  },
  {
    title: "The Trading Academy",
    status: "shipped",
    body: "Fourteen structured courses, a recommended learning path, four recurring desk sessions a week and a glossary written against our own specifications rather than a textbook.",
    detail: [
      "Free from registration, before any deposit is made",
      "Taught by the trading operations and risk desks",
    ],
  },
  {
    title: "Arabic and French across the whole surface",
    status: "building",
    body: "Support already answers in all three languages. The remaining work is the portal, the spec sheet and the academy, which are being translated rather than machine-rendered.",
    detail: [
      "Right-to-left layout for the portal and the public site",
      "Localised funding documentation and KYC guidance",
    ],
  },
  {
    title: "Per-instrument analytics in the portal",
    status: "building",
    body: "Expectancy, average R, slippage and cost contribution broken out by instrument and by session, from your own trade history rather than a generic dashboard.",
    detail: [
      "Session-tagged execution quality reporting",
      "Exportable trade list for your own journal",
    ],
  },
  {
    title: "Copy trading and strategy sharing",
    status: "next",
    body: "A reviewed route for consistently profitable traders to publish a strategy, and for others to allocate to it, with performance and risk stated up front.",
    detail: [
      "Risk-desk review rather than an open leaderboard",
      "Full fee disclosure before any allocation is made",
    ],
  },
];

const statusMeta: Record<
  MilestoneStatus,
  { label: string; tone: "mint" | "brand" | "neutral"; icon: typeof CheckCircle2 }
> = {
  shipped: { label: "Live today", tone: "mint", icon: CheckCircle2 },
  building: { label: "In build", tone: "brand", icon: Loader2 },
  next: { label: "Queued next", tone: "neutral", icon: Target },
};

export function Roadmap() {
  return (
    <ol className="relative flex flex-col gap-8">
      <span
        aria-hidden="true"
        className="rail-dotted absolute top-4 bottom-4 start-[7px] w-px"
      />

      {milestones.map((milestone, index) => {
        const meta = statusMeta[milestone.status];
        const Icon = meta.icon;

        return (
          <Reveal
            as="li"
            key={milestone.title}
            delay={Math.min(index, 4) * 0.05}
            className="relative ps-10"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2 start-0 size-[15px] rounded-full border-2",
                milestone.status === "shipped" && "border-mint bg-mint/25",
                milestone.status === "building" && "border-brand bg-brand/25",
                milestone.status === "next" && "border-line bg-bg",
              )}
            />

            <div className="border-line-soft bg-panel rounded-2xl border p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={meta.tone} className="gap-1.5">
                  <Icon className="size-3" aria-hidden="true" />
                  {meta.label}
                </Badge>
                <h3 className="text-ink font-display text-base font-semibold">
                  {milestone.title}
                </h3>
              </div>

              <p className="text-muted mt-3 text-sm leading-relaxed">
                {milestone.body}
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {milestone.detail.map((point) => (
                  <li
                    key={point}
                    className="text-faint flex gap-2 text-[0.8125rem]"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-line mt-2 size-1 shrink-0 rounded-full"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
