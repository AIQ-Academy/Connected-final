import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import type { PayoutStatus } from "@/components/admin/labels";
import { PayoutRow, type PayoutRowData } from "@/components/admin/payout-row";
import { EmptyState } from "@/components/app/empty-state";
import { Table, TableWrap, Th } from "@/components/app/data-table";
import {
  AppMain,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/app/panel";
import { StatCard } from "@/components/app/stat-card";
import { getPayoutQueue } from "@/db/admin-queries";
import { formatDate, formatDateTime } from "@/lib/trading";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payout queue",
  robots: { index: false, follow: false },
};

/** Open requests sit above anything the desk has already settled. */
const queueRank: Record<PayoutStatus, number> = {
  requested: 0,
  processing: 1,
  paid: 2,
  rejected: 3,
};

export default async function AdminPayoutsPage() {
  const queue = await getPayoutQueue(30);

  const sorted = [...queue].sort((a, b) => {
    const byStatus =
      queueRank[a.payout.status as PayoutStatus] -
      queueRank[b.payout.status as PayoutStatus];
    if (byStatus !== 0) return byStatus;
    return (
      new Date(b.payout.requestedAt).getTime() -
      new Date(a.payout.requestedAt).getTime()
    );
  });

  const rows: PayoutRowData[] = sorted.map(
    ({ payout, account, user, tierName }) => ({
      id: payout.id,
      requestedLabel: formatDate(payout.requestedAt),
      requestedTitle: formatDateTime(payout.requestedAt),
      fullName: user.fullName,
      email: user.email,
      login: account.login,
      tierName,
      amountLabel: formatCurrency(Number(payout.amount)),
      method: payout.method,
      status: payout.status as PayoutStatus,
      notes: payout.notes,
    }),
  );

  const sumBy = (status: PayoutStatus) =>
    queue
      .filter((row) => row.payout.status === status)
      .reduce((total, row) => total + Number(row.payout.amount), 0);

  const requestedTotal = sumBy("requested");
  const processingTotal = sumBy("processing");

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const paidThisMonth = queue
    .filter(
      (row) =>
        row.payout.status === "paid" &&
        new Date(row.payout.processedAt ?? row.payout.requestedAt) >=
          monthStart,
    )
    .reduce((total, row) => total + Number(row.payout.amount), 0);

  const openCount = queue.filter(
    (row) =>
      row.payout.status === "requested" || row.payout.status === "processing",
  ).length;

  return (
    <AppMain>
      <PageHeader
        eyebrow="Treasury"
        title="Payout queue"
        description="Profit-split withdrawals from funded traders. Approving moves a request into processing; marking it paid stamps the settlement time on the record."
      />

      <section aria-label="Payout totals">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Requested"
            value={formatCurrency(requestedTotal)}
            hint="Awaiting a first review from the desk"
            tone="amber"
          />
          <StatCard
            label="In processing"
            value={formatCurrency(processingTotal)}
            hint="Approved and with the payments provider"
            tone="brand"
          />
          <StatCard
            label="Paid this month"
            value={formatCurrency(paidThisMonth)}
            hint={`Settled since ${formatDate(monthStart)}`}
            tone="mint"
          />
        </div>
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Requests"
          description={
            openCount > 0
              ? `${formatNumber(openCount, 0)} open request${openCount === 1 ? "" : "s"} across the last ${formatNumber(queue.length, 0)} payouts.`
              : `No open requests across the last ${formatNumber(queue.length, 0)} payouts.`
          }
        />

        {rows.length === 0 ? (
          <div className="px-5 py-6 sm:px-6">
            <EmptyState
              icon={<Wallet />}
              title="No payout requests"
              description="Funded traders request their profit split from the client portal. Every request lands here with the account and tier attached."
            />
          </div>
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[82rem]">
                <caption className="sr-only">
                  Payout requests with approve, mark paid and reject actions
                </caption>
                <thead>
                  <tr>
                    <Th>Requested</Th>
                    <Th>Trader</Th>
                    <Th>Account</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th>Notes</Th>
                    <Th>Decision</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((payout) => (
                    <PayoutRow key={payout.id} payout={payout} />
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            <p className="text-faint px-5 py-3 text-[0.75rem] sm:hidden">
              Scroll the table sideways to reach the approval controls.
            </p>
          </>
        )}
      </Panel>
    </AppMain>
  );
}
