import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import {
  leadStatusLabels,
  leadStatusOrder,
  sourceLabel,
  tierLabel,
  type LeadStatus,
} from "@/components/admin/labels";
import { LeadRow, type LeadRowData } from "@/components/admin/lead-row";
import { EmptyState } from "@/components/app/empty-state";
import { Table, TableWrap, Th } from "@/components/app/data-table";
import {
  AppMain,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/app/panel";
import { Badge } from "@/components/ui/badge";
import { getLeads } from "@/db/admin-queries";
import { getAccountTiers } from "@/db/queries";
import { formatDateTime, leadStatusTone, relativeTime } from "@/lib/trading";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM leads",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const [leads, tiers] = await Promise.all([getLeads(40), getAccountTiers()]);

  const tierLookup = tiers.map((tier) => ({
    code: tier.code,
    name: tier.name,
    accountSize: Number(tier.accountSize),
  }));

  const statusCounts = leadStatusOrder.map((status) => ({
    status,
    count: leads.filter((lead) => lead.status === status).length,
  }));

  const sourceCounts = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      const key = lead.source ?? "direct";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const rows: LeadRowData[] = leads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    country: lead.country,
    source: lead.source,
    tierLabel: tierLabel(lead.interestedTier, tierLookup),
    status: lead.status as LeadStatus,
    createdLabel: relativeTime(lead.createdAt),
    createdTitle: formatDateTime(lead.createdAt),
    notes: lead.notes,
  }));

  return (
    <AppMain>
      <PageHeader
        eyebrow="Sales"
        title="CRM leads"
        description="Every registration, contact form, chatbot capture and newsletter signup, newest first. Change a status inline and the pipeline updates immediately."
      />

      <section
        aria-label="Pipeline summary"
        className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"
      >
        <Panel className="p-5">
          <p className="text-faint mb-4 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            Pipeline
          </p>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {statusCounts.map(({ status, count }) => (
              <div key={status}>
                <dt className="mb-1.5">
                  <Badge tone={leadStatusTone[status]}>
                    {leadStatusLabels[status]}
                  </Badge>
                </dt>
                <dd className="font-display tabular text-[1.5rem] leading-none font-semibold">
                  {formatNumber(count, 0)}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="p-5">
          <p className="text-faint mb-4 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            Where they came from
          </p>
          {sourceCounts.length === 0 ? (
            <p className="text-muted text-[0.8125rem]">
              No leads captured yet.
            </p>
          ) : (
            <dl className="flex flex-col gap-2.5">
              {sourceCounts.map(([source, count]) => (
                <div
                  key={source}
                  className="flex items-center justify-between gap-3"
                >
                  <dt className="text-muted text-[0.8125rem]">
                    {sourceLabel(source === "direct" ? null : source)}
                  </dt>
                  <dd className="tabular font-mono text-[0.8125rem] font-medium">
                    {formatNumber(count, 0)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="All leads"
          description={`${formatNumber(leads.length, 0)} most recent record${leads.length === 1 ? "" : "s"}. Notes are truncated — hover to read the full entry.`}
        />

        {rows.length === 0 ? (
          <div className="px-5 py-6 sm:px-6">
            <EmptyState
              icon={<UserPlus />}
              title="No leads captured yet"
              description="Registrations, contact enquiries and chatbot captures all land in this table the moment they are submitted."
            />
          </div>
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[68rem]">
                <caption className="sr-only">
                  CRM leads with inline pipeline status controls
                </caption>
                <thead>
                  <tr>
                    <Th>Lead</Th>
                    <Th>Phone</Th>
                    <Th>Country</Th>
                    <Th>Source</Th>
                    <Th>Interested tier</Th>
                    <Th>Created</Th>
                    <Th>Notes</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            <p className="text-faint px-5 py-3 text-[0.75rem] sm:hidden">
              Scroll the table sideways to reach the status control.
            </p>
          </>
        )}
      </Panel>
    </AppMain>
  );
}
