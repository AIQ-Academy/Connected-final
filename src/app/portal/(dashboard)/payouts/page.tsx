import type { Metadata } from "next";
import { ArrowRight, Wallet } from "lucide-react";

import { AppMain, PageHeader, Panel, PanelBody, PanelHeader } from "@/components/app/panel";
import { Table, TableWrap, Td, Th, Tr } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import { nextPayoutWindow } from "@/components/portal/account-parts";
import {
  PayoutRequestForm,
  type PayoutAccountOption,
} from "@/components/portal/payout-request-form";
import { MIN_PAYOUT } from "@/components/portal/payout-methods";
import { WorkspaceUnavailable } from "@/components/portal/workspace-unavailable";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { PortalPayout } from "@/db/portal-queries";
import { requireSession } from "@/lib/auth";
import { formatDate, payoutStatusLabels, payoutStatusTone } from "@/lib/trading";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payouts" };

export default async function PortalPayoutsPage() {
  const session = await requireSession("/portal/payouts");
  const workspace = await loadWorkspace(session.userId);

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable surface="your payout history" />
      </AppMain>
    );
  }

  const { accounts, payouts } = workspace;

  const fundedAccounts: PayoutAccountOption[] = accounts
    .filter(({ account }) => account.status === "funded")
    .map(({ account, tier }) => {
      const window = nextPayoutWindow(account, tier);
      return {
        id: account.id,
        login: account.login,
        tierName: tier.name,
        available: Math.max(0, account.currentBalance - account.startingBalance),
        cadence: tier.payoutFrequency,
        nextWindow: formatDate(window.date),
      };
    });

  const paid = payouts.filter(({ payout }) => payout.status === "paid");
  const paidTotal = paid.reduce((sum, { payout }) => sum + payout.amount, 0);
  const inFlight = payouts.filter(
    ({ payout }) => payout.status === "requested" || payout.status === "processing",
  );
  const inFlightTotal = inFlight.reduce((sum, { payout }) => sum + payout.amount, 0);
  const withdrawable = fundedAccounts.reduce(
    (sum, account) => sum + account.available,
    0,
  );

  const onHold = accounts.some(({ account }) => account.status === "payout_hold");

  return (
    <AppMain>
      <PageHeader
        eyebrow="Payouts"
        title="Withdraw your profit share"
        description="Every request you have made, what the desk did with it, and a form to open the next one."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Lifetime paid out"
          value={formatCurrency(paidTotal, { decimals: 2 })}
          tone="mint"
          hint={
            paid.length
              ? `${paid.length} payout${paid.length === 1 ? "" : "s"} settled since ${formatDate(paid[paid.length - 1]?.payout.requestedAt)}`
              : "No payout has been released yet"
          }
          icon={<Wallet aria-hidden="true" />}
        />
        <StatCard
          label="Awaiting release"
          value={formatCurrency(inFlightTotal, { decimals: 2 })}
          tone={inFlightTotal > 0 ? "amber" : "neutral"}
          hint={
            inFlight.length
              ? `${inFlight.length} request${inFlight.length === 1 ? "" : "s"} with the desk`
              : "Nothing in the queue"
          }
        />
        <StatCard
          label="Available to withdraw"
          value={formatCurrency(withdrawable, { decimals: 2 })}
          hint={
            fundedAccounts.length
              ? `Profit on ${fundedAccounts.length} funded account${fundedAccounts.length === 1 ? "" : "s"}, before the profit split is applied`
              : "Requires a funded account"
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Panel>
          <PanelHeader
            title="Request a payout"
            description={
              fundedAccounts.length
                ? "The desk reviews every request by hand before it is released."
                : "Available on funded accounts."
            }
          />
          <PanelBody>
            {fundedAccounts.length ? (
              <PayoutRequestForm accounts={fundedAccounts} />
            ) : (
              <EmptyState
                className="border-0 py-8"
                icon={<Wallet />}
                title="No funded account to withdraw from"
                description={
                  accounts.length
                    ? "Payouts open the moment an account clears phase 2. Your evaluation progress and remaining targets are on the accounts page."
                    : "Your first payout request becomes available once an account is allocated and funded."
                }
                action={
                  <ButtonLink href="/portal/accounts" variant="soft">
                    View evaluation progress
                    <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                }
              />
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="The payout cycle" />
          <PanelBody className="text-muted flex flex-col gap-3 text-[0.8125rem]">
            <p>
              Windows open every two weeks on funded accounts, and every week on
              the Professional tier. You can request any amount from{" "}
              {formatCurrency(MIN_PAYOUT)} up to your withdrawable profit.
            </p>
            <p>
              Approved requests are released within 24 to 48 hours. Bank wires
              usually settle in one to three business days; crypto normally
              arrives the same day.
            </p>
            <p>
              Connect Funded absorbs the processing fee on every method. Identity
              verification must be complete before the first release.
            </p>
            {onHold && (
              <p className="text-amber">
                One of your accounts is on a temporary withdrawal hold. Support
                will confirm in the portal as soon as it lifts.
              </p>
            )}
            <ButtonLink href="/portal/kyc" variant="ghost" size="sm" className="self-start">
              Check verification status
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Payout history"
          description={
            payouts.length
              ? `${payouts.length} request${payouts.length === 1 ? "" : "s"} on record.`
              : "Nothing requested yet."
          }
        />

        {payouts.length === 0 ? (
          <EmptyState
            className="m-5 border-dashed sm:m-6"
            icon={<Wallet />}
            title="No payout requests yet"
            description="When you submit your first request it appears here with its status, the method used and the date the desk released it."
          />
        ) : (
          <>
            <TableWrap className="hidden sm:block">
              <Table className="min-w-[54rem]">
                <thead>
                  <tr>
                    <Th>Requested</Th>
                    <Th>Account</Th>
                    <Th>Tier</Th>
                    <Th className="text-end">Amount</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th>Processed</Th>
                    <Th>Notes</Th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(({ payout, accountLogin, tierName }) => (
                    <Tr key={payout.id}>
                      <Td className="tabular whitespace-nowrap">
                        {formatDate(payout.requestedAt)}
                      </Td>
                      <Td className="font-mono text-[0.8125rem] whitespace-nowrap">
                        {accountLogin}
                      </Td>
                      <Td className="whitespace-nowrap">{tierName}</Td>
                      <Td className="tabular text-end font-medium whitespace-nowrap">
                        {formatCurrency(payout.amount, { decimals: 2 })}
                      </Td>
                      <Td className="whitespace-nowrap">{payout.method ?? "—"}</Td>
                      <Td>
                        <Badge tone={payoutStatusTone[payout.status]}>
                          {payoutStatusLabels[payout.status]}
                        </Badge>
                      </Td>
                      <Td className="tabular text-muted whitespace-nowrap">
                        {payout.processedAt ? formatDate(payout.processedAt) : "—"}
                      </Td>
                      <Td className="text-muted max-w-[16rem] text-[0.8125rem]">
                        {payout.notes ?? "—"}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <ul className="divide-line-soft divide-y sm:hidden">
              {payouts.map((row) => (
                <PayoutCard key={row.payout.id} row={row} />
              ))}
            </ul>
          </>
        )}
      </Panel>
    </AppMain>
  );
}

function PayoutCard({ row }: { row: PortalPayout }) {
  const { payout, accountLogin, tierName } = row;

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display tabular text-[1.0625rem] font-semibold">
            {formatCurrency(payout.amount, { decimals: 2 })}
          </p>
          <p className="text-muted mt-0.5 text-[0.78125rem]">
            {tierName}
            <span className="text-faint mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="font-mono">{accountLogin}</span>
          </p>
        </div>
        <Badge tone={payoutStatusTone[payout.status]}>
          {payoutStatusLabels[payout.status]}
        </Badge>
      </div>

      <dl className="text-muted mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.78125rem]">
        <div className="flex justify-between gap-2">
          <dt className="text-faint">Requested</dt>
          <dd className="tabular">{formatDate(payout.requestedAt)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-faint">Processed</dt>
          <dd className="tabular">
            {payout.processedAt ? formatDate(payout.processedAt) : "—"}
          </dd>
        </div>
        <div className="col-span-2 flex justify-between gap-2">
          <dt className="text-faint">Method</dt>
          <dd>{payout.method ?? "—"}</dd>
        </div>
      </dl>

      {payout.notes && (
        <p className="text-muted mt-2 text-[0.78125rem]">{payout.notes}</p>
      )}
    </li>
  );
}
