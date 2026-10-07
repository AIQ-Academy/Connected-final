import type { ReactNode } from "react";
import { CalendarClock, CircleCheck, TriangleAlert } from "lucide-react";

import { ProgressBar } from "@/components/app/progress-bar";
import { Badge } from "@/components/ui/badge";
import type { AccountTier, TradingAccount } from "@/db/schema";
import {
  accountStatusLabels,
  accountStatusTone,
  evaluationProgress,
  formatDate,
} from "@/lib/trading";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const platformLabels: Record<TradingAccount["platform"], string> = {
  mt5: "MetaTrader 5",
  ctrader: "cTrader",
  web_terminal: "Web Terminal",
};

/**
 * Payout windows run on a fixed cadence from the day the account was funded,
 * so the next one is arithmetic rather than a stored schedule.
 */
export function nextPayoutWindow(account: TradingAccount, tier: AccountTier) {
  const frequency = tier.payoutFrequency.toLowerCase();
  const cycleDays = frequency.startsWith("bi")
    ? 14
    : frequency.includes("month")
      ? 30
      : 7;

  const anchor = account.fundedAt ?? account.createdAt;
  const dayMs = 86_400_000;
  const elapsed = Math.max(0, Date.now() - anchor.getTime());
  const cyclesDone = Math.floor(elapsed / (cycleDays * dayMs)) + 1;
  const date = new Date(anchor.getTime() + cyclesDone * cycleDays * dayMs);

  return {
    date,
    cycleDays,
    cadence: tier.payoutFrequency,
    daysAway: Math.max(0, Math.ceil((date.getTime() - Date.now()) / dayMs)),
  };
}

export function drawdownTone(used: number, max: number): "mint" | "amber" | "loss" {
  if (max <= 0) return "mint";
  const ratio = used / max;
  if (ratio >= 0.75) return "loss";
  if (ratio >= 0.45) return "amber";
  return "mint";
}

export function AccountHeading({
  account,
  tier,
  action,
}: {
  account: TradingAccount;
  tier: AccountTier;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-display text-[1.0625rem] leading-tight font-semibold">
            {tier.name} <span className="text-faint">·</span>{" "}
            <span className="tabular">{formatCurrency(tier.accountSize)}</span>
          </h3>
          <Badge tone={accountStatusTone[account.status]}>
            {accountStatusLabels[account.status]}
          </Badge>
        </div>
        <p className="text-muted mt-1.5 text-[0.8125rem]">
          {platformLabels[account.platform]}
          <span className="text-faint mx-2" aria-hidden="true">
            ·
          </span>
          <span className="sr-only">Account login </span>
          <span className="text-ink font-mono text-[0.78125rem]">
            {account.login}
          </span>
        </p>
      </div>
      {action}
    </div>
  );
}

export function BalanceRow({
  account,
  className,
}: {
  account: TradingAccount;
  className?: string;
}) {
  const profit = account.currentBalance - account.startingBalance;

  return (
    <dl
      className={cn(
        "border-line-soft bg-sunken/50 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border",
        className,
      )}
    >
      <Cell label="Balance" value={formatCurrency(account.currentBalance, { decimals: 2 })} />
      <Cell
        label="Equity"
        value={formatCurrency(account.equity, { decimals: 2 })}
        tone={account.equity >= account.currentBalance ? "mint" : "loss"}
      />
      <Cell
        label="Starting"
        value={formatCurrency(account.startingBalance)}
        note={`${profit >= 0 ? "+" : "−"}${formatCurrency(Math.abs(profit), { decimals: 2 })}`}
        noteTone={profit >= 0 ? "mint" : "loss"}
      />
    </dl>
  );
}

function Cell({
  label,
  value,
  tone = "neutral",
  note,
  noteTone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "mint" | "loss";
  note?: string;
  noteTone?: "neutral" | "mint" | "loss";
}) {
  const toneClass = {
    neutral: "text-ink",
    mint: "text-mint",
    loss: "text-loss",
  };

  return (
    <div className="bg-panel px-3.5 py-3 sm:px-4">
      <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "tabular mt-1.5 text-[0.9375rem] leading-none font-semibold",
          toneClass[tone],
        )}
      >
        {value}
      </dd>
      {note && (
        <p className={cn("tabular mt-1 text-[0.75rem]", toneClass[noteTone])}>{note}</p>
      )}
    </div>
  );
}

/** Profit-against-target, drawdown and trading-day bars for a live evaluation. */
export function EvaluationBlock({
  account,
  tier,
}: {
  account: TradingAccount;
  tier: AccountTier;
}) {
  const progress = evaluationProgress(account, tier);
  const phase = account.status === "phase1" ? "Phase 1" : "Phase 2";
  const target = progress.targetAmount ?? 0;
  const targetMet = target > 0 && progress.profit >= target;
  const daysMet = progress.tradingDaysRemaining === 0;

  const dayPct =
    tier.minTradingDays > 0
      ? Math.min(100, (account.tradingDays / tier.minTradingDays) * 100)
      : 100;

  return (
    <div className="flex flex-col gap-5">
      <Track
        label={`${phase} profit target`}
        readout={
          <>
            <span
              className={cn(
                "font-medium",
                progress.profit >= 0 ? "text-mint" : "text-loss",
              )}
            >
              {formatCurrency(progress.profit, { decimals: 2 })}
            </span>
            <span className="text-faint"> of </span>
            {formatCurrency(target)}
            <span className="text-faint"> · </span>
            {Math.round(progress.progressPct)}%
          </>
        }
        bar={
          <ProgressBar
            value={progress.progressPct}
            tone={targetMet ? "mint" : "brand"}
            label={`${phase} profit target, ${Math.round(progress.progressPct)} percent complete`}
          />
        }
        footnote={
          targetMet
            ? `The ${progress.targetPct}% target on the starting balance is cleared.`
            : `${formatCurrency(progress.remainingToTarget, { decimals: 2 })} of profit left to reach the ${progress.targetPct}% target.`
        }
      />

      <Track
        label="Overall drawdown used"
        readout={
          <>
            <span className="font-medium">
              {formatNumber(progress.drawdownUsedPct, 2)}%
            </span>
            <span className="text-faint"> of </span>
            {formatNumber(tier.maxOverallDrawdownPct, 0)}%
          </>
        }
        bar={
          <ProgressBar
            value={(progress.drawdownUsedPct / tier.maxOverallDrawdownPct) * 100}
            tone={drawdownTone(progress.drawdownUsedPct, tier.maxOverallDrawdownPct)}
            label={`Overall drawdown used, ${formatNumber(progress.drawdownUsedPct, 2)} of ${tier.maxOverallDrawdownPct} percent`}
          />
        }
        footnote={`${formatNumber(progress.drawdownHeadroomPct, 2)}% of headroom left, measured against your starting balance. The daily limit is ${formatNumber(tier.maxDailyDrawdownPct, 0)}%.`}
      />

      <Track
        label="Minimum trading days"
        readout={
          <>
            <span className="font-medium">{account.tradingDays} completed</span>
            <span className="text-faint"> · </span>
            {tier.minTradingDays} required
          </>
        }
        bar={
          <ProgressBar
            value={dayPct}
            tone={daysMet ? "mint" : "brand"}
            label={`Trading days completed, ${account.tradingDays} of ${tier.minTradingDays}`}
          />
        }
        footnote={
          daysMet
            ? "The trading-day requirement is satisfied. There is no deadline on this phase."
            : `${progress.tradingDaysRemaining} more day${progress.tradingDaysRemaining === 1 ? "" : "s"} with at least one closed position.`
        }
      />

      {targetMet && daysMet && (
        <p className="border-mint/35 bg-mint/10 text-mint flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-[0.8125rem]">
          <CircleCheck className="mt-px size-4 shrink-0" aria-hidden="true" />
          <span>
            Both conditions for {phase} are met. The desk reviews completed
            phases within one business day and moves the account on without
            anything further from you.
          </span>
        </p>
      )}
    </div>
  );
}

/** Profit, split and the next payout window for a funded account. */
export function FundedBlock({
  account,
  tier,
}: {
  account: TradingAccount;
  tier: AccountTier;
}) {
  const progress = evaluationProgress(account, tier);
  const window = nextPayoutWindow(account, tier);
  const returnPct =
    account.startingBalance > 0
      ? (progress.profit / account.startingBalance) * 100
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid gap-4 sm:grid-cols-3">
        <Highlight
          label="Profit generated"
          value={formatCurrency(progress.profit, { decimals: 2 })}
          tone={progress.profit >= 0 ? "mint" : "loss"}
          note={`${formatPercent(returnPct)} on allocated capital`}
        />
        <Highlight
          label={`Your share at ${tier.profitSplitPct}%`}
          value={formatCurrency(progress.profitSplitAmount, { decimals: 2 })}
          note="Withdrawable once the window opens"
        />
        <Highlight
          label="Next payout window"
          value={formatDate(window.date)}
          note={
            window.daysAway === 0
              ? `Open today · ${window.cadence} cycle`
              : `In ${window.daysAway} day${window.daysAway === 1 ? "" : "s"} · ${window.cadence} cycle`
          }
        />
      </dl>

      <Track
        label="Overall drawdown used"
        readout={
          <>
            <span className="font-medium">
              {formatNumber(progress.drawdownUsedPct, 2)}%
            </span>
            <span className="text-faint"> of </span>
            {formatNumber(tier.maxOverallDrawdownPct, 0)}%
          </>
        }
        bar={
          <ProgressBar
            value={(progress.drawdownUsedPct / tier.maxOverallDrawdownPct) * 100}
            tone={drawdownTone(progress.drawdownUsedPct, tier.maxOverallDrawdownPct)}
            label={`Overall drawdown used, ${formatNumber(progress.drawdownUsedPct, 2)} of ${tier.maxOverallDrawdownPct} percent`}
          />
        }
        footnote={`${formatNumber(progress.drawdownHeadroomPct, 2)}% of headroom left. The ${formatNumber(tier.maxDailyDrawdownPct, 0)}% daily limit still applies on a funded account.`}
      />

      <p className="text-faint flex items-start gap-2 text-[0.78125rem]">
        <CalendarClock className="mt-px size-4 shrink-0" aria-hidden="true" />
        Requests approved inside a window are released within 24 to 48 hours.
        Connect Funded absorbs the processing fee on every method.
      </p>
    </div>
  );
}

export function BreachNotice({
  account,
  tier,
}: {
  account: TradingAccount;
  tier: AccountTier;
}) {
  const loss = account.startingBalance - account.currentBalance;

  return (
    <div className="border-loss/35 bg-loss/10 rounded-[var(--radius-md)] border px-4 py-3.5">
      <p className="text-loss flex items-center gap-2 text-[0.875rem] font-medium">
        <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
        This account was closed on a rule breach
      </p>
      <p className="text-muted mt-2 text-[0.8125rem]">
        Drawdown reached {formatNumber(account.currentDrawdownPct, 2)}% against a{" "}
        {formatNumber(tier.maxOverallDrawdownPct, 0)}% limit
        {loss > 0 ? (
          <>
            , a realised loss of{" "}
            <span className="tabular">{formatCurrency(loss, { decimals: 2 })}</span>
          </>
        ) : null}
        . The account was stopped on {formatDate(account.failedAt)} and no further
        orders can be placed on login {account.login}. Nothing is owed and no
        further charge applies.
      </p>
      <p className="text-faint mt-2 text-[0.78125rem]">
        You can start a new evaluation at any time. Previous performance on a
        breached account does not affect the terms you are offered.
      </p>
    </div>
  );
}

export function PayoutHoldNotice({ account }: { account: TradingAccount }) {
  return (
    <div className="border-amber/35 bg-amber/10 rounded-[var(--radius-md)] border px-4 py-3.5">
      <p className="text-amber flex items-center gap-2 text-[0.875rem] font-medium">
        <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
        Withdrawals are paused on this account
      </p>
      <p className="text-muted mt-2 text-[0.8125rem]">
        Trading on login {account.login} continues as normal. The desk has placed
        a temporary hold on withdrawals while it completes a routine review, and
        support will message you in the portal the moment it lifts.
      </p>
    </div>
  );
}

function Track({
  label,
  readout,
  bar,
  footnote,
}: {
  label: string;
  readout: ReactNode;
  bar: ReactNode;
  footnote: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[0.8125rem] font-medium">{label}</p>
        <p className="tabular text-muted text-[0.8125rem]">{readout}</p>
      </div>
      <div className="mt-2">{bar}</div>
      <p className="text-faint mt-1.5 text-[0.78125rem]">{footnote}</p>
    </div>
  );
}

function Highlight({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "neutral" | "mint" | "loss";
}) {
  return (
    <div className="border-line-soft bg-sunken/40 rounded-[var(--radius-md)] border px-4 py-3.5">
      <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "font-display tabular mt-2 text-[1.25rem] leading-none font-semibold",
          tone === "mint" && "text-mint",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </dd>
      <p className="text-muted mt-1.5 text-[0.78125rem]">{note}</p>
    </div>
  );
}
