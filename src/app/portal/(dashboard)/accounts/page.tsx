import type { Metadata } from "next";
import { ArrowRight, Gauge } from "lucide-react";

import { AppMain, PageHeader, Panel, PanelHeader } from "@/components/app/panel";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import { AccountDetail } from "@/components/portal/account-detail";
import { WorkspaceUnavailable } from "@/components/portal/workspace-unavailable";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary, type DictionaryKey } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: getDictionary(locale)["portal.accounts.metaTitle"] };
}

export default async function PortalAccountsPage() {
  const [session, locale] = await Promise.all([requireSession("/portal/accounts"), getServerLocale()]);
  const dictionary = getDictionary(locale);
  const t = (key: DictionaryKey) => dictionary[key];
  const localeTag = locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-US";
  const formatMoney = (value: number, decimals = 0) => new Intl.NumberFormat(localeTag, {
    style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(value);
  const formatPercentLocale = (value: number) => `${new Intl.NumberFormat(localeTag, { maximumFractionDigits: 2 }).format(value)}%`;
  const workspace = await loadWorkspace(session.userId);

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable surface="your trading accounts" />
      </AppMain>
    );
  }

  const { accounts } = workspace;

  const live = accounts.filter(({ account }) => account.status !== "failed");
  const allocated = live.reduce((sum, { account }) => sum + account.startingBalance, 0);
  const balance = live.reduce((sum, { account }) => sum + account.currentBalance, 0);
  const profit = balance - allocated;
  const inEvaluation = accounts.filter(
    ({ account }) => account.status === "phase1" || account.status === "phase2",
  ).length;
  const funded = accounts.filter(({ account }) => account.status === "funded").length;

  return (
    <AppMain>
      <PageHeader
        eyebrow={t("portal.accounts.eyebrow")}
        title={t("portal.accounts.title")}
        description={t("portal.accounts.description")}
      />

      {accounts.length === 0 ? (
        <Panel>
          <EmptyState
            className="border-0 py-16"
            icon={<Gauge />}
            title={t("portal.accounts.noneTitle")}
            description={t("portal.accounts.noneDescription")}
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/portal/support">
                  {t("portal.accounts.activate")}
                  <ArrowRight aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/accounts" variant="soft">
                  {t("portal.accounts.compare")}
                </ButtonLink>
              </div>
            }
          />
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("portal.accounts.count")}
              value={new Intl.NumberFormat(localeTag).format(accounts.length)}
              hint={t("portal.accounts.countHint").replace("{funded}", new Intl.NumberFormat(localeTag).format(funded)).replace("{evaluating}", new Intl.NumberFormat(localeTag).format(inEvaluation))}
            />
            <StatCard
              label={t("portal.accounts.capital")}
              value={formatMoney(allocated)}
              hint={t("portal.accounts.capitalHint")}
            />
            <StatCard
              label={t("portal.accounts.balance")}
              value={formatMoney(balance, 2)}
              hint={t("portal.accounts.balanceHint")}
            />
            <StatCard
              label={t("portal.accounts.profit")}
              value={formatMoney(profit, 2)}
              tone={profit >= 0 ? "mint" : "loss"}
              hint={
                allocated > 0
                  ? t("portal.accounts.profitHint").replace("{percent}", formatPercentLocale((profit / allocated) * 100))
                  : t("portal.accounts.profitMeasured")
              }
            />
          </div>

          <div className="flex flex-col gap-6">
            {accounts.map(({ account, tier }) => (
              <AccountDetail key={account.id} account={account} tier={tier} />
            ))}
          </div>

          <Panel>
            <PanelHeader
              title={t("portal.accounts.enforcedTitle")}
              description={t("portal.accounts.enforcedDescription")}
            />
            <ul className="text-muted grid gap-4 px-5 py-5 text-[0.8125rem] sm:grid-cols-3 sm:px-6">
              {[
                {
                  title: t("portal.accounts.dailyDrawdown"),
                  body: t("portal.accounts.dailyDrawdownBody"),
                },
                {
                  title: t("portal.accounts.overallDrawdown"),
                  body: t("portal.accounts.overallDrawdownBody"),
                },
                {
                  title: t("portal.accounts.phaseProgression"),
                  body: t("portal.accounts.phaseProgressionBody"),
                },
              ].map((item) => (
                <li key={item.title}>
                  <p className="text-ink text-[0.875rem] font-medium">{item.title}</p>
                  <p className="mt-1">{item.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </AppMain>
  );
}
