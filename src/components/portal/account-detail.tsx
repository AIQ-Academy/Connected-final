import { Panel, PanelBody } from "@/components/app/panel";
import {
  AccountHeading,
  BalanceRow,
  BreachNotice,
  EvaluationBlock,
  FundedBlock,
  PayoutHoldNotice,
} from "@/components/portal/account-parts";
import { EvaluationTimeline } from "@/components/portal/evaluation-timeline";
import type { AccountTier, TradingAccount } from "@/db/schema";
import { formatDate } from "@/lib/trading";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function AccountDetail({
  account,
  tier,
}: {
  account: TradingAccount;
  tier: AccountTier;
}) {
  const rules: [string, string][] = [
    ["Phase 1 target", `${formatNumber(tier.phase1TargetPct, 0)}%`],
    ["Phase 2 target", `${formatNumber(tier.phase2TargetPct, 0)}%`],
    ["Max daily drawdown", `${formatNumber(tier.maxDailyDrawdownPct, 0)}%`],
    ["Max overall drawdown", `${formatNumber(tier.maxOverallDrawdownPct, 0)}%`],
    ["Minimum trading days", `${tier.minTradingDays}`],
    ["Profit split", `${tier.profitSplitPct}%`],
    ["Payout cycle", capitalise(tier.payoutFrequency)],
    ["Max leverage", tier.maxLeverage],
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelBody className="flex flex-col gap-5">
        <AccountHeading
          account={account}
          tier={tier}
          action={
            <div className="text-faint text-end text-[0.78125rem]">
              <p>Opened {formatDate(account.createdAt)}</p>
              <p className="tabular">
                {formatCurrency(tier.accountSize)} allocation
              </p>
            </div>
          }
        />

        <BalanceRow account={account} />

        {(account.status === "phase1" || account.status === "phase2") && (
          <EvaluationBlock account={account} tier={tier} />
        )}
        {account.status === "funded" && <FundedBlock account={account} tier={tier} />}
        {account.status === "payout_hold" && (
          <>
            <FundedBlock account={account} tier={tier} />
            <PayoutHoldNotice account={account} />
          </>
        )}
        {account.status === "failed" && <BreachNotice account={account} tier={tier} />}
      </PanelBody>

      <div className="border-line-soft grid border-t lg:grid-cols-2">
        <section className="border-line-soft border-b px-5 py-5 sm:px-6 lg:border-e lg:border-b-0">
          <h4 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            {tier.name} rule set
          </h4>
          <dl className="mt-3.5 grid gap-x-6 sm:grid-cols-2">
            {rules.map(([label, value]) => (
              <div
                key={label}
                className="border-line-soft flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
              >
                <dt className="text-muted text-[0.8125rem]">{label}</dt>
                <dd className="tabular text-[0.8125rem] font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-faint mt-3.5 text-[0.78125rem]">
            Drawdown is measured against the higher of your starting balance or
            the equity recorded at the 00:00 UTC reset, and it includes floating
            profit and loss. Neither phase has a time limit.
          </p>
        </section>

        <section className="px-5 py-5 sm:px-6">
          <h4 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            Evaluation timeline
          </h4>
          <div className="mt-4">
            <EvaluationTimeline account={account} />
          </div>
        </section>
      </div>
    </Panel>
  );
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
