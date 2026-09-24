import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";

import type {
  TicketPriority,
  TicketStatus,
} from "@/components/admin/labels";
import { TicketRow, type TicketRowData } from "@/components/admin/ticket-row";
import { EmptyState } from "@/components/app/empty-state";
import { Table, TableWrap, Th } from "@/components/app/data-table";
import {
  AppMain,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/app/panel";
import { Badge } from "@/components/ui/badge";
import { getSupportQueue } from "@/db/admin-queries";
import { formatDateTime, relativeTime } from "@/lib/trading";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support queue",
  robots: { index: false, follow: false },
};

/** High priority first, then whatever moved most recently. */
const priorityRank: Record<TicketPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export default async function AdminSupportPage() {
  const queue = await getSupportQueue();

  const sorted = [...queue].sort((a, b) => {
    const byPriority =
      priorityRank[a.ticket.priority as TicketPriority] -
      priorityRank[b.ticket.priority as TicketPriority];
    if (byPriority !== 0) return byPriority;
    return (
      new Date(b.ticket.updatedAt).getTime() -
      new Date(a.ticket.updatedAt).getTime()
    );
  });

  const rows: TicketRowData[] = sorted.map(
    ({ ticket, user, messageCount }) => ({
      id: ticket.id,
      reference: ticket.reference,
      subject: ticket.subject,
      fullName: user.fullName,
      email: user.email,
      priority: ticket.priority as TicketPriority,
      status: ticket.status as TicketStatus,
      messageCount,
      updatedLabel: relativeTime(ticket.updatedAt),
      updatedTitle: formatDateTime(ticket.updatedAt),
    }),
  );

  const highPriority = rows.filter((row) => row.priority === "high").length;
  const awaitingTrader = rows.filter((row) => row.status === "pending").length;

  return (
    <AppMain>
      <PageHeader
        eyebrow="Client service"
        title="Support queue"
        description="Open and in-progress tickets across every funded and evaluation account. High priority sits at the top; closing a ticket removes it from this list."
      />

      <section aria-label="Queue summary">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Tickets in the queue",
              value: rows.length,
              tone: "brand" as const,
            },
            {
              label: "High priority",
              value: highPriority,
              tone: "loss" as const,
            },
            {
              label: "Awaiting the trader",
              value: awaitingTrader,
              tone: "amber" as const,
            },
          ].map((item) => (
            <Panel key={item.label} className="p-5">
              <Badge tone={item.tone}>{item.label}</Badge>
              <p className="font-display tabular mt-3 text-[1.75rem] leading-none font-semibold">
                {formatNumber(item.value, 0)}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Open tickets"
          description="Reference numbers match the ones traders see in the client portal."
        />

        {rows.length === 0 ? (
          <div className="px-5 py-6 sm:px-6">
            <EmptyState
              icon={<LifeBuoy />}
              title="The queue is clear"
              description="No ticket is waiting on the desk. A new message from a trader reopens their thread and it reappears here."
            />
          </div>
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[74rem]">
                <caption className="sr-only">
                  Open support tickets with status controls
                </caption>
                <thead>
                  <tr>
                    <Th>Reference</Th>
                    <Th>Subject</Th>
                    <Th>Trader</Th>
                    <Th>Priority</Th>
                    <Th>Status</Th>
                    <Th className="text-center">Messages</Th>
                    <Th>Last activity</Th>
                    <Th>Set status</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            <p className="text-faint px-5 py-3 text-[0.75rem] sm:hidden">
              Scroll the table sideways to reach the status controls.
            </p>
          </>
        )}
      </Panel>
    </AppMain>
  );
}
