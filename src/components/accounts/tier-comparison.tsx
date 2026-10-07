import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import type { AccountTier } from "@/db/schema";
import { cn, formatCurrency } from "@/lib/utils";

type Row = {
  label: string;
  hint?: string;
  /** Rendered once per tier. */
  value: (tier: AccountTier) => ReactNode;
  emphasis?: boolean;
};

const yes = <Check className="text-mint inline size-4" aria-label="Included" />;

const rows: Row[] = [
  {
    label: "Account size",
    value: (tier) => formatCurrency(tier.accountSize, { decimals: 0 }),
    emphasis: true,
  },
  {
    label: "Evaluation fee",
    hint: "Refunded with your first payout",
    value: (tier) => formatCurrency(tier.price, { decimals: 0 }),
    emphasis: true,
  },
  {
    label: "Phase 1 profit target",
    value: (tier) =>
      `${tier.phase1TargetPct}% · ${formatCurrency((tier.accountSize * tier.phase1TargetPct) / 100, { decimals: 0 })}`,
  },
  {
    label: "Phase 2 profit target",
    value: (tier) =>
      `${tier.phase2TargetPct}% · ${formatCurrency((tier.accountSize * tier.phase2TargetPct) / 100, { decimals: 0 })}`,
  },
  {
    label: "Max daily drawdown",
    hint: "Measured from the 00:00 UTC anchor, floating P&L included",
    value: (tier) =>
      `${tier.maxDailyDrawdownPct}% · ${formatCurrency((tier.accountSize * tier.maxDailyDrawdownPct) / 100, { decimals: 0 })}`,
  },
  {
    label: "Max overall drawdown",
    hint: "Static, measured from the initial balance",
    value: (tier) =>
      `${tier.maxOverallDrawdownPct}% · ${formatCurrency((tier.accountSize * tier.maxOverallDrawdownPct) / 100, { decimals: 0 })}`,
  },
  { label: "Minimum trading days", value: (tier) => tier.minTradingDays },
  { label: "Time limit", value: () => "None" },
  {
    label: "Profit split",
    value: (tier) => `${tier.profitSplitPct}%`,
    emphasis: true,
  },
  { label: "Payout frequency", value: (tier) => tier.payoutFrequency },
  { label: "Payout release", value: () => "24–48 hours" },
  { label: "Max leverage", value: (tier) => tier.maxLeverage },
  { label: "Scaling ceiling", value: () => "$2,000,000" },
  { label: "MetaTrader 5, cTrader, Web Terminal", value: () => yes },
  { label: "All six asset classes", value: () => yes },
  { label: "Expert advisors and algorithmic execution", value: () => yes },
  { label: "News trading", value: () => yes },
  { label: "Weekend holding", value: () => yes },
  { label: "Copy-trading across your own accounts", value: () => yes },
  {
    label: "Dedicated account manager",
    value: (tier) =>
      tier.accountSize >= 200_000 ? yes : <span aria-label="Not included">—</span>,
  },
];

export function TierComparison({ tiers }: { tiers: AccountTier[] }) {
  return (
    <TableShell caption="Every published rule, compared across all five account tiers">
      <Table className="min-w-[860px]">
        <caption className="sr-only">
          Every published rule, compared across all five account tiers
        </caption>
        <thead>
          <tr>
            {/* Opaque background so the frozen first column stays legible
                while the tier columns scroll underneath it. */}
            <Th className="bg-sunken sticky left-0 z-10 min-w-[16rem]">Rule</Th>
            {tiers.map((tier) => (
              <Th key={tier.id} className="text-right">
                <span className="text-ink block text-[0.8125rem] font-semibold tracking-normal normal-case">
                  {tier.name}
                </span>
                <span className="text-faint block font-mono text-[0.6875rem] tracking-[0.1em]">
                  {formatCurrency(tier.accountSize, { decimals: 0 })}
                </span>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.label}>
              <Td className="bg-panel sticky left-0 z-10">
                <span className="text-ink block text-[0.8125rem] font-medium">
                  {row.label}
                </span>
                {row.hint && (
                  <span className="text-faint mt-0.5 block text-xs">
                    {row.hint}
                  </span>
                )}
              </Td>
              {tiers.map((tier) => (
                <Td
                  key={tier.id}
                  className={cn(
                    "tabular text-right font-mono text-[0.8125rem]",
                    row.emphasis ? "text-ink font-medium" : "text-muted",
                  )}
                >
                  {row.value(tier)}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}
