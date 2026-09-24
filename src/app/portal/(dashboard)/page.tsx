import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Gauge,
  LifeBuoy,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { AppMain, PageHeader, Panel, PanelHeader } from "@/components/app/panel";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import { AccountCard } from "@/components/portal/account-card";
import { ActivityFeed } from "@/components/portal/activity-feed";
import { WorkspaceUnavailable } from "@/components/portal/workspace-unavailable";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { formatDate, kycStatusLabels, kycStatusTone } from "@/lib/trading";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

// The page sits in the same segment as the layout that owns the title
// template, so it has to spell the full title out.
export const metadata: Metadata = {
  title: { absolute: "Dashboard · Connect Funded client portal" },
};

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const session = await requireSession("/portal");
  const { denied } = await searchParams;
  const workspace = await loadWorkspace(session.userId);

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable />
      </AppMain>
    );
  }

  const { user, accounts, payouts, kyc, tickets } = workspace;

  const firstName = user.fullName.split(/\s+/)[0] ?? "trader";
  const reference = `CF-${user.id.slice(0, 6).toUpperCase()}`;
  const kycState = kyc?.status ?? "not_started";

  const live = accounts.filter(({ account }) => account.status !== "failed");
  const fundedCount = accounts.filter(
    ({ account }) => account.status === "funded",
  ).length;

  const allocated = live.reduce((sum, { account }) => sum + account.startingBalance, 0);
  const equity = live.reduce((sum, { account }) => sum + account.equity, 0);
  const equityDelta = allocated > 0 ? ((equity - allocated) / allocated) * 100 : 0;

  const paidPayouts = payouts.filter(({ payout }) => payout.status === "paid");
  const paidTotal = paidPayouts.reduce((sum, { payout }) => sum + payout.amount, 0);
  const lastPaid = paidPayouts[0]?.payout.processedAt ?? null;

  const inFlight = payouts.filter(
    ({ payout }) => payout.status === "requested" || payout.status === "processing",
  );
  const inFlightTotal = inFlight.reduce((sum, { payout }) => sum + payout.amount, 0);

  const openTickets = tickets.filter(({ ticket }) => ticket.status !== "closed");

  return (
    <AppMain>
      <PageHeader
        eyebrow="Client portal"
        title={`Welcome back, ${firstName}`}
        description={
          accounts.length
            ? `Balances, evaluation progress and payout status for every account on your profile, as of ${formatDate(new Date())}.`
            : "Your profile is live. The moment your evaluation fee is settled, your platform credentials and account metrics appear here."
        }
        action={
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <p className="text-faint text-[0.75rem]">
              Client reference{" "}
              <span className="text-ink font-mono text-[0.8125rem]">{reference}</span>
            </p>
            <Link
              href="/portal/kyc"
              className="rounded-full transition-opacity hover:opacity-85"
            >
              <Badge tone={kycStatusTone[kycState]} size="md">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Identity {kycStatusLabels[kycState].toLowerCase()}
              </Badge>
            </Link>
          </div>
        }
      />

      {denied === "1" && (
        <div
          role="status"
          className="border-amber/35 bg-amber/10 flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3.5"
        >
          <ShieldAlert
            className="text-amber mt-px size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-[0.8125rem]">
            <span className="font-medium">That area needs an operations role.</span>{" "}
            <span className="text-muted">
              Your client portal covers everything on your own accounts. If you
              believe you should have desk access, ask support to review your
              permissions.
            </span>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Allocated capital"
          value={formatCurrency(allocated)}
          hint={
            accounts.length
              ? `${live.length} live account${live.length === 1 ? "" : "s"}, ${fundedCount} funded`
              : "No account allocated yet"
          }
          icon={<Gauge aria-hidden="true" />}
        />
        <StatCard
          label="Combined equity"
          value={formatCurrency(equity, { decimals: 2 })}
          tone={equityDelta >= 0 ? "mint" : "loss"}
          hint={
            allocated > 0
              ? `${formatPercent(equityDelta)} against allocated capital`
              : "Equity appears once an account is active"
          }
        />
        <StatCard
          label="Lifetime paid out"
          value={formatCurrency(paidTotal, { decimals: 2 })}
          hint={
            paidPayouts.length
              ? `${paidPayouts.length} payout${paidPayouts.length === 1 ? "" : "s"} settled, most recent ${formatDate(lastPaid)}`
              : "Your first payout will be listed here"
          }
          icon={<Wallet aria-hidden="true" />}
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(inFlightTotal, { decimals: 2 })}
          tone={inFlightTotal > 0 ? "amber" : "neutral"}
          hint={
            inFlight.length
              ? `${inFlight.length} request${inFlight.length === 1 ? "" : "s"} with the desk, released 24 to 48 hours after approval`
              : "Nothing awaiting release"
          }
        />
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.125rem] font-semibold">
              Your accounts
            </h2>
            <p className="text-muted mt-1 text-[0.8125rem]">
              {accounts.length
                ? "Live balances from the broker bridge, refreshed on every visit."
                : "Nothing allocated yet."}
            </p>
          </div>
          {accounts.length > 0 && (
            <ButtonLink href="/portal/accounts" variant="soft" size="sm">
              Rules and timelines
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          )}
        </div>

        {accounts.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {accounts.map(({ account, tier }) => (
              <AccountCard key={account.id} account={account} tier={tier} />
            ))}
          </div>
        ) : (
          <Panel>
            <EmptyState
              className="border-0 py-14"
              icon={<Gauge />}
              title="No trading account yet"
              description="Your evaluation account is created as soon as the fee is settled. Card and crypto payments activate within minutes; bank transfers clear the next business day."
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/portal/support">
                    Ask the desk to activate
                    <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href="/accounts" variant="soft">
                    Review the account sizes
                  </ButtonLink>
                </div>
              }
            />
          </Panel>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent activity"
            description="Payout movements and support replies across your profile."
            action={
              <Link
                href="/portal/payouts"
                className="text-brand-light hover:text-brand text-[0.8125rem] transition-colors"
              >
                Payout history
              </Link>
            }
          />
          <ActivityFeed payouts={payouts} tickets={tickets} />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="Quick actions" />
            <ul className="divide-line-soft divide-y">
              <QuickAction
                href="/portal/payouts"
                icon={<Wallet className="size-4" aria-hidden="true" />}
                title="Request a payout"
                detail={
                  fundedCount
                    ? "Withdraw your profit share from any funded account."
                    : "Available as soon as your first account is funded."
                }
              />
              <QuickAction
                href="/portal/kyc"
                icon={<BadgeCheck className="size-4" aria-hidden="true" />}
                title="Verification centre"
                detail={
                  kycState === "verified"
                    ? "Your identity is verified and payouts are unrestricted."
                    : "Verification must be complete before a payout is released."
                }
              />
              <QuickAction
                href="/portal/support"
                icon={<LifeBuoy className="size-4" aria-hidden="true" />}
                title="Message the desk"
                detail={
                  openTickets.length
                    ? `${openTickets.length} conversation${openTickets.length === 1 ? "" : "s"} still open with support.`
                    : "Median first response is under two hours, 24 hours a day on weekdays."
                }
              />
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="How payouts run" />
            <div className="text-muted flex flex-col gap-2.5 px-5 py-5 text-[0.8125rem] sm:px-6">
              <p>
                Payout windows open every two weeks on funded accounts, and
                weekly on the Professional tier. There is no minimum number of
                trades and no requirement to hold positions overnight.
              </p>
              <p>
                Once the desk approves a request, funds are released within 24 to
                48 hours. Connect Funded absorbs the processing fee on every
                method, so the amount you request is the amount that leaves us.
              </p>
              <p className="text-faint">
                Your own bank or wallet provider may still apply a receiving
                charge, which is outside our control.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppMain>
  );
}

function QuickAction({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="hover:bg-sunken/60 group flex items-start gap-3.5 px-5 py-3.5 transition-colors sm:px-6"
      >
        <span
          className="border-line-soft bg-sunken text-brand-light grid size-8 shrink-0 place-items-center rounded-full border"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.875rem] font-medium">{title}</span>
          <span className="text-muted block text-[0.8125rem]">{detail}</span>
        </span>
        <ArrowRight
          className="text-faint group-hover:text-brand-light mt-1 size-3.5 shrink-0 transition-colors"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
