/**
 * Pure helpers shared by the portal and the admin dashboard. No database and
 * no server-only imports, so they can render on either side of the boundary.
 */

export type AccountLike = {
  status: "phase1" | "phase2" | "funded" | "failed" | "payout_hold";
  startingBalance: number;
  currentBalance: number;
  equity: number;
  currentDrawdownPct: number;
  tradingDays: number;
};

export type TierLike = {
  name: string;
  phase1TargetPct: number;
  phase2TargetPct: number;
  maxDailyDrawdownPct: number;
  maxOverallDrawdownPct: number;
  minTradingDays: number;
  profitSplitPct: number;
};

export const accountStatusLabels: Record<AccountLike["status"], string> = {
  phase1: "Evaluation — Phase 1",
  phase2: "Evaluation — Phase 2",
  funded: "Funded",
  failed: "Breached",
  payout_hold: "Payout hold",
};

export const accountStatusTone: Record<
  AccountLike["status"],
  "brand" | "mint" | "amber" | "loss" | "neutral"
> = {
  phase1: "brand",
  phase2: "brand",
  funded: "mint",
  failed: "loss",
  payout_hold: "amber",
};

export type EvaluationProgress = {
  /** Null once the account is funded — there is no target left to hit. */
  targetPct: number | null;
  targetAmount: number | null;
  profit: number;
  /** 0-100, clamped. */
  progressPct: number;
  remainingToTarget: number;
  drawdownUsedPct: number;
  drawdownHeadroomPct: number;
  tradingDaysRemaining: number;
  profitSplitAmount: number;
};

export function evaluationProgress(
  account: AccountLike,
  tier: TierLike,
): EvaluationProgress {
  const profit = account.currentBalance - account.startingBalance;

  const targetPct =
    account.status === "phase1"
      ? tier.phase1TargetPct
      : account.status === "phase2"
        ? tier.phase2TargetPct
        : null;

  const targetAmount =
    targetPct === null ? null : (account.startingBalance * targetPct) / 100;

  const progressPct =
    targetAmount && targetAmount > 0
      ? clamp((profit / targetAmount) * 100, 0, 100)
      : profit > 0
        ? 100
        : 0;

  return {
    targetPct,
    targetAmount,
    profit,
    progressPct,
    remainingToTarget: targetAmount ? Math.max(0, targetAmount - profit) : 0,
    drawdownUsedPct: account.currentDrawdownPct,
    drawdownHeadroomPct: Math.max(
      0,
      tier.maxOverallDrawdownPct - account.currentDrawdownPct,
    ),
    tradingDaysRemaining: Math.max(0, tier.minTradingDays - account.tradingDays),
    profitSplitAmount: Math.max(0, (profit * tier.profitSplitPct) / 100),
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const payoutStatusLabels = {
  requested: "Requested",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
} as const;

export const payoutStatusTone = {
  requested: "amber",
  processing: "brand",
  paid: "mint",
  rejected: "loss",
} as const;

export const kycStatusLabels = {
  not_started: "Not started",
  pending: "In review",
  verified: "Verified",
  rejected: "Action required",
} as const;

export const kycStatusTone = {
  not_started: "neutral",
  pending: "amber",
  verified: "mint",
  rejected: "loss",
} as const;

export const leadStatusTone = {
  new: "brand",
  contacted: "amber",
  qualified: "mint",
  converted: "mint",
  lost: "neutral",
} as const;

export const ticketStatusTone = {
  open: "amber",
  pending: "brand",
  closed: "neutral",
} as const;

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function relativeTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.345],
    ["month", 12],
    ["year", Number.POSITIVE_INFINITY],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let value_ = seconds;
  for (const [unit, size] of units) {
    if (Math.abs(value_) < size) return formatter.format(-Math.round(value_), unit);
    value_ /= size;
  }
  return formatter.format(-Math.round(value_), "year");
}
