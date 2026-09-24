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
    title: "One rulebook across every tier",
    status: "shipped",
    body: "A 5% daily and 10% overall drawdown, a four trading day minimum and no calendar deadline — identical from the $10,000 Starter account to the $200,000 Professional one.",
    detail: [
      "Only the profit target and the split change by tier",
      "No hidden consistency rule, no forced position closure",
    ],
  },
  {
    title: "Risk enforced server-side",
    status: "shipped",
    body: "Drawdown is evaluated at the platform as positions move, not reconciled after the fact by a human reading a statement the next morning.",
    detail: [
      "Breaches close the account at the moment they occur",
      "Live headroom is exposed in the portal and the Web Terminal",
    ],
  },
  {
    title: "Every asset class from one login",
    status: "shipped",
    body: "Forex, precious metals, energy, global indices, share CFDs and major cryptocurrencies on a single funded account, with no per-class permission to request.",
    detail: [
      "Leverage set per class, from 1:100 on forex to 1:5 on crypto",
      "MetaTrader 5, cTrader and the Web Terminal share one account",
    ],
  },
  {
    title: "Payout rails that settle in days, not weeks",
    status: "shipped",
    body: "Eight funding and withdrawal methods across cards, bank transfer, e-wallets and crypto, with the processing fee absorbed on every one of them.",
    detail: [
      "Approved payouts released within 24 to 48 hours",
      "Bi-weekly cycles as standard, weekly on Professional",
    ],
  },
  {
    title: "Published scaling to $2,000,000",
    status: "shipped",
    body: "Return 10% across two consecutive payout cycles and the allocation doubles. The plan is published before you buy, so the target is never moved once you are trading toward it.",
    detail: [
      "Profit split steps up with each doubling and never falls",
      "Combined allocation capped at $400,000 before scaling",
    ],
  },
  {
    title: "The Trading Academy",
    status: "shipped",
    body: "Fourteen structured courses, a recommended learning path, four recurring desk sessions a week and a glossary written against this rulebook rather than a textbook.",
    detail: [
      "Free from registration, before any evaluation is purchased",
      "Taught by the trading operations and risk desks",
    ],
  },
  {
    title: "Arabic and French across the whole surface",
    status: "building",
    body: "Support already answers in all three languages. The remaining work is the portal, the rulebook and the academy, which are being translated rather than machine-rendered.",
    detail: [
      "Right-to-left layout for the portal and the public site",
      "Localised payout documentation and KYC guidance",
    ],
  },
  {
    title: "Per-instrument analytics in the portal",
    status: "building",
    body: "Expectancy, average R, slippage and drawdown contribution broken out by instrument and by session, from your own trade history rather than a generic dashboard.",
    detail: [
      "Session-tagged execution quality reporting",
      "Exportable trade list for your own journal",
    ],
  },
  {
    title: "Allocations above the combined cap",
    status: "next",
    body: "A reviewed route for consistently profitable traders who have reached the $400,000 combined allocation cap and want to run more capital under a formal agreement.",
    detail: [
      "Risk-desk review rather than an automatic upgrade",
      "Bespoke reporting and a named operations contact",
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
        className="rail-dotted absolute top-4 bottom-4 left-[7px] w-px"
      />

      {milestones.map((milestone, index) => {
        const meta = statusMeta[milestone.status];
        const Icon = meta.icon;

        return (
          <Reveal
            as="li"
            key={milestone.title}
            delay={Math.min(index, 4) * 0.05}
            className="relative pl-10"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2 left-0 size-[15px] rounded-full border-2",
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
