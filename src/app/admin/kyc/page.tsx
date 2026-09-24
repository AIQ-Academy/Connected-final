import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { KycRow, type KycRowData } from "@/components/admin/kyc-row";
import type { KycStatus } from "@/components/admin/labels";
import { EmptyState } from "@/components/app/empty-state";
import { Table, TableWrap, Th } from "@/components/app/data-table";
import {
  AppMain,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/app/panel";
import { Badge } from "@/components/ui/badge";
import { getKycQueue } from "@/db/admin-queries";
import { formatDateTime, kycStatusLabels, kycStatusTone } from "@/lib/trading";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KYC queue",
  robots: { index: false, follow: false },
};

/** Anything the desk can act on sorts above anything already settled. */
const reviewOrder: Record<KycStatus, number> = {
  pending: 0,
  rejected: 1,
  not_started: 2,
  verified: 3,
};

const summaryOrder: KycStatus[] = [
  "pending",
  "verified",
  "rejected",
  "not_started",
];

export default async function AdminKycPage() {
  const queue = await getKycQueue();

  const sorted = [...queue].sort((a, b) => {
    const byStatus =
      reviewOrder[a.kyc.status as KycStatus] -
      reviewOrder[b.kyc.status as KycStatus];
    if (byStatus !== 0) return byStatus;
    return (
      new Date(b.kyc.submittedAt ?? 0).getTime() -
      new Date(a.kyc.submittedAt ?? 0).getTime()
    );
  });

  const rows: KycRowData[] = sorted.map(({ kyc, user }) => ({
    id: kyc.id,
    fullName: user.fullName,
    email: user.email,
    country: user.country,
    status: kyc.status as KycStatus,
    submittedLabel: kyc.submittedAt ? formatDateTime(kyc.submittedAt) : "—",
    reviewedLabel: kyc.reviewedAt ? formatDateTime(kyc.reviewedAt) : "—",
    rejectionReason: kyc.rejectionReason,
  }));

  const pending = rows.filter((row) => row.status === "pending").length;

  return (
    <AppMain>
      <PageHeader
        eyebrow="Compliance"
        title="KYC queue"
        description="Identity and residency checks, oldest submissions surfaced first. Approving a trader unlocks payouts; rejecting one sends the reason you write here."
      />

      <section aria-label="Verification summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryOrder.map((status) => {
            const count = rows.filter((row) => row.status === status).length;
            return (
              <Panel key={status} className="p-5">
                <Badge tone={kycStatusTone[status]}>
                  {kycStatusLabels[status]}
                </Badge>
                <p className="font-display tabular mt-3 text-[1.75rem] leading-none font-semibold">
                  {formatNumber(count, 0)}
                </p>
              </Panel>
            );
          })}
        </div>
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Verifications"
          description={
            pending > 0
              ? `${formatNumber(pending, 0)} document set${pending === 1 ? "" : "s"} waiting on a decision.`
              : "Nothing is waiting on a decision right now."
          }
        />

        {rows.length === 0 ? (
          <div className="px-5 py-6 sm:px-6">
            <EmptyState
              icon={<ShieldCheck />}
              title="No verifications on file"
              description="A KYC record is created for every trader at registration and moves into this queue as soon as they upload their documents."
            />
          </div>
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[72rem]">
                <caption className="sr-only">
                  KYC verifications with approve and reject actions
                </caption>
                <thead>
                  <tr>
                    <Th>Trader</Th>
                    <Th>Country</Th>
                    <Th>Status</Th>
                    <Th>Submitted</Th>
                    <Th>Reviewed</Th>
                    <Th>Rejection reason</Th>
                    <Th>Decision</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <KycRow key={row.id} row={row} />
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            <p className="text-faint px-5 py-3 text-[0.75rem] sm:hidden">
              Scroll the table sideways to reach the approve and reject
              controls.
            </p>
          </>
        )}
      </Panel>
    </AppMain>
  );
}
