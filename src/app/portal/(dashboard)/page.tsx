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
import { kycStatusTone } from "@/lib/trading";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary, type DictionaryKey } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

// The page sits in the same segment as the layout that owns the title
// template, so it has to spell the full title out.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: { absolute: getDictionary(locale)["portal.dashboard.metaTitle"] } };
}

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const session = await requireSession("/portal");
  const [locale, { denied }, workspace] = await Promise.all([
    getServerLocale(), searchParams, loadWorkspace(session.userId),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: DictionaryKey) => dictionary[key];
  const localeTag = locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-US";
  const formatMoney = (value: number, decimals = 0) => new Intl.NumberFormat(localeTag, {
    style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(value);
  const formatPercentLocale = (value: number) => `${new Intl.NumberFormat(localeTag, { maximumFractionDigits: 2 }).format(value)}%`;
  const formatDateLocale = (value: Date | string) => new Intl.DateTimeFormat(localeTag, { dateStyle: "medium" }).format(new Date(value));

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable />
      </AppMain>
    );
  }

  const { user, accounts, payouts, kyc, tickets } = workspace;

  const firstName = user.fullName.split(/\s+/)[0] ?? t("shell.trader");
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
        eyebrow={t("shell.clientPortal")}
        title={t("portal.dashboard.welcomeName").replace("{name}", firstName)}
        description={
          accounts.length
            ? t("portal.dashboard.activeSummary").replace("{date}", formatDateLocale(new Date()))
            : t("portal.dashboard.pendingSummary")
        }
        action={
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <p className="text-faint text-[0.75rem]">
              {t("portal.dashboard.clientRef")}{" "}
              <span className="text-ink font-mono text-[0.8125rem]">{reference}</span>
            </p>
            <Link
              href="/portal/kyc"
              className="rounded-full transition-opacity hover:opacity-85"
            >
              <Badge tone={kycStatusTone[kycState]} size="md">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                {t("portal.dashboard.identity")} {t(({ not_started: "portal.dashboard.kycNotStarted", pending: "portal.dashboard.kycPending", verified: "portal.dashboard.kycVerified", rejected: "portal.dashboard.kycRejected" } as const)[kycState]).toLowerCase()}
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
            <span className="font-medium">{t("portal.dashboard.deniedTitle")}</span>{" "}
            <span className="text-muted">
              {t("portal.dashboard.deniedBody")}
            </span>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("portal.dashboard.allocatedCapital")}
          value={formatMoney(allocated)}
          hint={
            accounts.length
              ? t("portal.dashboard.liveFunded").replace("{live}", new Intl.NumberFormat(localeTag).format(live.length)).replace("{funded}", new Intl.NumberFormat(localeTag).format(fundedCount))
              : t("portal.dashboard.noneAllocated")
          }
          icon={<Gauge aria-hidden="true" />}
        />
        <StatCard
          label={t("portal.dashboard.combinedEquity")}
          value={formatMoney(equity, 2)}
          tone={equityDelta >= 0 ? "mint" : "loss"}
          hint={
            allocated > 0
              ? t("portal.dashboard.equityAgainstCapital").replace("{percent}", formatPercentLocale(equityDelta))
              : t("portal.dashboard.equityWhenActive")
          }
        />
        <StatCard
          label={t("portal.dashboard.lifetimePaid")}
          value={formatMoney(paidTotal, 2)}
          hint={
            paidPayouts.length
              ? t("portal.dashboard.payoutsSettled").replace("{count}", new Intl.NumberFormat(localeTag).format(paidPayouts.length)).replace("{date}", lastPaid ? formatDateLocale(lastPaid) : "")
              : t("portal.dashboard.firstPayout")
          }
          icon={<Wallet aria-hidden="true" />}
        />
        <StatCard
          label={t("portal.dashboard.pendingPayout")}
          value={formatMoney(inFlightTotal, 2)}
          tone={inFlightTotal > 0 ? "amber" : "neutral"}
          hint={
            inFlight.length
              ? t("portal.dashboard.requestsInFlight").replace("{count}", new Intl.NumberFormat(localeTag).format(inFlight.length))
              : t("portal.dashboard.nothingAwaiting")
          }
        />
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.125rem] font-semibold">
              {t("portal.dashboard.yourAccounts")}
            </h2>
            <p className="text-muted mt-1 text-[0.8125rem]">
              {accounts.length
                ? t("portal.dashboard.liveBalances")
                : t("portal.dashboard.nothingAllocated")}
            </p>
          </div>
          {accounts.length > 0 && (
            <ButtonLink href="/portal/accounts" variant="soft" size="sm">
              {t("portal.dashboard.rulesTimelines")}
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
              title={t("portal.dashboard.noTradingAccount")}
              description={t("portal.dashboard.noAccountDescription")}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/portal/support">
                    {t("portal.dashboard.activate")}
                    <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href="/accounts" variant="soft">
                    {t("portal.dashboard.reviewSizes")}
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
            title={t("portal.dashboard.recentActivity")}
            description={t("portal.dashboard.activityDescription")}
            action={
              <Link
                href="/portal/payouts"
                className="text-brand-light hover:text-brand text-[0.8125rem] transition-colors"
              >
                {t("portal.dashboard.payoutHistory")}
              </Link>
            }
          />
          <ActivityFeed payouts={payouts} tickets={tickets} />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title={t("portal.dashboard.quickActions")} />
            <ul className="divide-line-soft divide-y">
              <QuickAction
                href="/portal/payouts"
                icon={<Wallet className="size-4" aria-hidden="true" />}
                title={t("portal.dashboard.requestPayout")}
                detail={
                  fundedCount
                    ? t("portal.dashboard.withdrawProfit")
                    : t("portal.dashboard.firstFunded")
                }
              />
              <QuickAction
                href="/portal/kyc"
                icon={<BadgeCheck className="size-4" aria-hidden="true" />}
                title={t("portal.dashboard.verificationCentre")}
                detail={
                  kycState === "verified"
                    ? t("portal.dashboard.verifiedIdentity")
                    : t("portal.dashboard.verifyBeforePayout")
                }
              />
              <QuickAction
                href="/portal/support"
                icon={<LifeBuoy className="size-4" aria-hidden="true" />}
                title={t("portal.dashboard.messageDesk")}
                detail={
                  openTickets.length
                    ? t("portal.dashboard.openConversations").replace("{count}", new Intl.NumberFormat(localeTag).format(openTickets.length))
                    : t("portal.dashboard.replyTarget")
                }
              />
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title={t("portal.dashboard.payoutsRun")} />
            <div className="text-muted flex flex-col gap-2.5 px-5 py-5 text-[0.8125rem] sm:px-6">
              <p>
                {t("portal.dashboard.payoutSchedule")}
              </p>
              <p>
                {t("portal.dashboard.payoutTiming")}
              </p>
              <p className="text-faint">
                {t("portal.dashboard.providerFees")}
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
