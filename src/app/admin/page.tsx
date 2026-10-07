import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Gauge,
  LifeBuoy,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { LiveRefresh } from "@/components/admin/live-refresh";
import {
  initials,
  sourceLabel,
  sourceTone,
  ticketPriorityLabels,
  ticketPriorityTone,
  tierLabel,
  type TicketPriority,
} from "@/components/admin/labels";
import { EmptyState } from "@/components/app/empty-state";
import {
  AppMain,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/app/panel";
import { StatCard } from "@/components/app/stat-card";
import { Badge, LiveDot } from "@/components/ui/badge";
import {
  getAdminKpis,
  getKycQueue,
  getPayoutQueue,
  getRecentSignups,
  getSupportQueue,
} from "@/db/admin-queries";
import { getAccountTiers } from "@/db/queries";
import {
  formatDateTime,
  kycStatusLabels,
  kycStatusTone,
  payoutStatusLabels,
  payoutStatusTone,
  relativeTime,
} from "@/lib/trading";
import {
  cn,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

/** A signup inside this window is still warm enough to call. */
const FRESH_WINDOW_MS = 10 * 60_000;

/**
 * The page is force-dynamic, so request time is exactly the clock the desk
 * should be reading. Kept out of the component body to stay on the right side
 * of the purity lint.
 */
function isFreshSignup(createdAt: Date | string) {
  return Date.now() - new Date(createdAt).getTime() < FRESH_WINDOW_MS;
}

export default async function AdminOverviewPage() {
  const [kpis, signups, kycQueue, tickets, payoutQueue, tiers] =
    await Promise.all([
      getAdminKpis(),
      getRecentSignups(12),
      getKycQueue(),
      getSupportQueue(),
      getPayoutQueue(),
      getAccountTiers(),
    ]);

  const tierLookup = tiers.map((tier) => ({
    code: tier.code,
    name: tier.name,
    accountSize: Number(tier.accountSize),
  }));

  const kycPending = kycQueue.filter((row) => row.kyc.status === "pending");
  const openTickets = tickets.filter((row) => row.ticket.status !== "closed");
  const openPayouts = payoutQueue.filter(
    (row) =>
      row.payout.status === "requested" || row.payout.status === "processing",
  );

  const freshCount = signups.filter((row) =>
    isFreshSignup(row.user.createdAt),
  ).length;

  return (
    <AppMain>
      <PageHeader
        eyebrow="Operations desk"
        title="Command centre"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <LiveDot />
            Reading straight from the production database. Registrations,
            verifications and payout requests land here the moment a trader
            submits them.
          </span>
        }
      />

      <section aria-label="Desk indicators">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total traders"
            value={formatNumber(kpis?.totalTraders ?? 0, 0)}
            hint={`${formatNumber(kpis?.signupsLast7Days ?? 0, 0)} joined in the last seven days`}
            icon={<Users />}
          />
          <StatCard
            label="Funded accounts"
            value={formatNumber(kpis?.fundedAccounts ?? 0, 0)}
            hint="Cleared both evaluation phases and trading firm capital"
            tone="mint"
            icon={<BadgeCheck />}
          />
          <StatCard
            label="In evaluation"
            value={formatNumber(kpis?.accountsInEvaluation ?? 0, 0)}
            hint="Phase 1 and phase 2 challenges currently live"
            tone="brand"
            icon={<Gauge />}
          />
          <StatCard
            label="Capital allocated"
            value={formatCompactCurrency(kpis?.capitalAllocated ?? 0)}
            hint="Notional across every evaluation and funded account"
            tone="brand"
            icon={<Banknote />}
          />
          <StatCard
            label="Payouts paid"
            value={formatCompactCurrency(kpis?.payoutsPaid ?? 0)}
            hint="Settled to traders since launch"
            tone="mint"
            icon={<Wallet />}
          />
          <StatCard
            label="Payouts pending"
            value={formatCompactCurrency(kpis?.payoutsPending ?? 0)}
            hint={`${openPayouts.length} request${openPayouts.length === 1 ? "" : "s"} awaiting treasury`}
            tone="amber"
            icon={<Banknote />}
          />
        </div>
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title={
            <span className="inline-flex items-center gap-2.5">
              <LiveDot />
              Live registrations
            </span>
          }
          description={
            freshCount > 0
              ? `${freshCount} account${freshCount === 1 ? "" : "s"} opened in the last ten minutes. Newest first.`
              : "Every account opened on connectfunded.com, newest first."
          }
          action={<LiveRefresh />}
        />

        <div aria-live="polite" aria-label="Newest registrations">
          {signups.length === 0 ? (
            <div className="px-5 py-6 sm:px-6">
              <EmptyState
                icon={<UserPlus />}
                title="No registrations yet"
                description="The moment someone completes the form at connectfunded.com/register, their name, chosen account and lead source appear here."
              />
            </div>
          ) : (
            <ol className="divide-line-soft divide-y">
              {signups.map(({ user, interestedTier, leadSource }) => {
                const isFresh = isFreshSignup(user.createdAt);
                const tier = tierLabel(interestedTier, tierLookup);

                return (
                  <li
                    key={user.id}
                    className={cn(
                      "relative flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6",
                      isFresh && "bg-brand-dim/25",
                    )}
                  >
                    {isFresh && (
                      <span
                        aria-hidden="true"
                        className="bg-brand absolute inset-y-0 start-0 w-[3px]"
                      />
                    )}

                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "font-display grid size-10 shrink-0 place-items-center rounded-full text-[0.8125rem] font-semibold",
                          isFresh
                            ? "bg-brand text-white"
                            : "bg-brand-dim text-brand-light",
                        )}
                      >
                        {initials(user.fullName)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[0.9375rem] font-medium">
                            {user.fullName}
                          </p>
                          {isFresh && (
                            <Badge tone="brand">
                              <LiveDot tone="brand" />
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-faint truncate text-[0.8125rem]">
                          {user.email}
                          {user.country ? ` · ${user.country}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge tone={tier ? "neutral" : "amber"}>
                        {tier ?? "No account chosen"}
                      </Badge>
                      <Badge tone={sourceTone(leadSource)}>
                        {sourceLabel(leadSource)}
                      </Badge>
                    </div>

                    <span
                      className="text-faint tabular shrink-0 font-mono text-[0.75rem] sm:w-28 sm:text-end"
                      title={formatDateTime(user.createdAt)}
                    >
                      {relativeTime(user.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-6">
          <p className="text-faint text-[0.78125rem]">
            Each registration also creates a CRM lead you can qualify without
            leaving the desk.
          </p>
          <QueueLink href="/admin/leads" label="Open CRM leads" />
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <QueuePreview
          title="KYC review"
          icon={<ShieldCheck />}
          count={kycPending.length}
          href="/admin/kyc"
          linkLabel="Open KYC queue"
          emptyTitle="Nothing to verify"
          emptyDescription="Every submitted document has been reviewed. New submissions arrive here automatically."
          rows={kycPending.slice(0, 4).map(({ kyc, user }) => ({
            key: kyc.id,
            primary: user.fullName,
            secondary: kyc.submittedAt
              ? `Submitted ${relativeTime(kyc.submittedAt)}`
              : "Awaiting documents",
            badge: {
              tone: kycStatusTone[kyc.status],
              label: kycStatusLabels[kyc.status],
            },
          }))}
        />

        <QueuePreview
          title="Support queue"
          icon={<LifeBuoy />}
          count={openTickets.length}
          href="/admin/support"
          linkLabel="Open support queue"
          emptyTitle="Inbox clear"
          emptyDescription="No ticket is waiting on the desk. Replies from traders reopen a thread automatically."
          rows={openTickets.slice(0, 4).map(({ ticket, user }) => ({
            key: ticket.id,
            primary: ticket.subject,
            secondary: `${ticket.reference} · ${user.fullName}`,
            badge: {
              tone: ticketPriorityTone[ticket.priority as TicketPriority],
              label: `${ticketPriorityLabels[ticket.priority as TicketPriority]} priority`,
            },
          }))}
        />

        <QueuePreview
          title="Payout requests"
          icon={<Wallet />}
          count={openPayouts.length}
          href="/admin/payouts"
          linkLabel="Open payout queue"
          emptyTitle="Treasury is settled"
          emptyDescription="No payout is waiting for approval. Requests from funded traders appear here on submission."
          rows={openPayouts.slice(0, 4).map(({ payout, user, tierName }) => ({
            key: payout.id,
            primary: `${formatCurrency(Number(payout.amount))} · ${user.fullName}`,
            secondary: `${tierName} · requested ${relativeTime(payout.requestedAt)}`,
            badge: {
              tone: payoutStatusTone[payout.status],
              label: payoutStatusLabels[payout.status],
            },
          }))}
        />
      </div>
    </AppMain>
  );
}

/* ---------------------------------------------------------------------- */

type PreviewRow = {
  key: string;
  primary: string;
  secondary: string;
  badge: { tone: "neutral" | "brand" | "mint" | "amber" | "loss"; label: string };
};

function QueuePreview({
  title,
  icon,
  count,
  href,
  linkLabel,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  href: string;
  linkLabel: string;
  rows: PreviewRow[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Panel className="flex flex-col overflow-hidden">
      <PanelHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span className="text-faint [&_svg]:size-4">{icon}</span>
            {title}
          </span>
        }
        action={
          <span className="bg-sunken text-muted tabular rounded-full px-2.5 py-1 font-mono text-[0.6875rem]">
            {count}
          </span>
        }
      />

      {rows.length === 0 ? (
        <div className="flex-1 px-5 py-5">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="h-full px-4 py-8"
          />
        </div>
      ) : (
        <ul className="divide-line-soft flex-1 divide-y">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1.5 px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-[0.875rem] font-medium">
                  {row.primary}
                </p>
                <Badge tone={row.badge.tone}>{row.badge.label}</Badge>
              </div>
              <p className="text-faint truncate text-[0.78125rem]">
                {row.secondary}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="border-line-soft border-t px-5 py-3.5">
        <QueueLink href={href} label={linkLabel} />
      </div>
    </Panel>
  );
}

function QueueLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-brand-light hover:text-ink inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-colors"
    >
      {label}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
