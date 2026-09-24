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
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Accounts" };

export default async function PortalAccountsPage() {
  const session = await requireSession("/portal/accounts");
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
        eyebrow="Accounts"
        title="Your trading accounts"
        description="Every rule that applies to your capital, the progress you have made against it, and the exact dates behind each phase."
      />

      {accounts.length === 0 ? (
        <Panel>
          <EmptyState
            className="border-0 py-16"
            icon={<Gauge />}
            title="No account has been allocated yet"
            description="Once your evaluation fee is settled the desk issues your platform credentials, and this page fills with your balance, drawdown headroom and phase timeline."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/portal/support">
                  Ask the desk to activate
                  <ArrowRight aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/accounts" variant="soft">
                  Compare account sizes
                </ButtonLink>
              </div>
            }
          />
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Accounts"
              value={String(accounts.length)}
              hint={`${funded} funded, ${inEvaluation} in evaluation`}
            />
            <StatCard
              label="Allocated capital"
              value={formatCurrency(allocated)}
              hint="Firm capital at risk on your behalf"
            />
            <StatCard
              label="Combined balance"
              value={formatCurrency(balance, { decimals: 2 })}
              hint="Closed profit and loss, excluding open positions"
            />
            <StatCard
              label="Net profit"
              value={formatCurrency(profit, { decimals: 2 })}
              tone={profit >= 0 ? "mint" : "loss"}
              hint={
                allocated > 0
                  ? `${formatPercent((profit / allocated) * 100)} across live accounts`
                  : "Measured against allocated capital"
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
              title="What the desk enforces automatically"
              description="These checks run on the broker bridge, not in a manual review."
            />
            <ul className="text-muted grid gap-4 px-5 py-5 text-[0.8125rem] sm:grid-cols-3 sm:px-6">
              {[
                {
                  title: "Daily drawdown",
                  body: "Measured against the higher of your starting balance or your equity at the 00:00 UTC reset, including floating profit and loss.",
                },
                {
                  title: "Overall drawdown",
                  body: "Static and measured against the initial account balance. It never trails your profit upward.",
                },
                {
                  title: "Phase progression",
                  body: "A phase closes the moment both the profit target and the minimum trading days are satisfied. There is no deadline.",
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
