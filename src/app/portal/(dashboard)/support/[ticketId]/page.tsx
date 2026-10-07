import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppMain, Panel, PanelHeader } from "@/components/app/panel";
import { TicketThread } from "@/components/portal/ticket-thread";
import { Badge } from "@/components/ui/badge";
import type { SupportTicket } from "@/db/schema";
import { getTicketThread } from "@/db/portal-queries";
import { requireSession } from "@/lib/auth";
import { formatDate, formatDateTime, relativeTime, ticketStatusTone } from "@/lib/trading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Conversation" };

const statusLabels: Record<SupportTicket["status"], string> = {
  open: "Open",
  pending: "In progress",
  closed: "Closed",
};

const statusCopy: Record<SupportTicket["status"], string> = {
  open: "Waiting on the desk. You will be emailed the moment an agent replies.",
  pending: "An agent is working on this. Add anything else that might help.",
  closed: "This conversation is closed. A reply reopens it straight away.",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await requireSession(`/portal/support/${ticketId}`);
  const thread = await getTicketThread(ticketId, session.userId);

  if (!thread) notFound();

  const { ticket, messages } = thread;

  return (
    <AppMain className="max-w-4xl">
      <div>
        <Link
          href="/portal/support"
          className="text-faint hover:text-ink inline-flex items-center gap-1.5 text-[0.8125rem] transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All conversations
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="eyebrow mb-2.5">
              <span className="chev" />
              {ticket.reference}
            </span>
            <h1 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
              {ticket.subject}
            </h1>
            <p className="text-muted mt-2 text-[0.8125rem]">
              Opened {formatDate(ticket.createdAt)}
              <span className="text-faint mx-2" aria-hidden="true">
                ·
              </span>
              <span title={`${formatDateTime(ticket.updatedAt)} UTC`}>
                Last activity {relativeTime(ticket.updatedAt)}
              </span>
              <span className="text-faint mx-2" aria-hidden="true">
                ·
              </span>
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ticket.priority !== "low" && (
              <Badge tone={ticket.priority === "high" ? "loss" : "neutral"} size="md">
                {ticket.priority} priority
              </Badge>
            )}
            <Badge tone={ticketStatusTone[ticket.status]} size="md">
              {statusLabels[ticket.status]}
            </Badge>
          </div>
        </div>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Conversation"
          description={statusCopy[ticket.status]}
        />
        <TicketThread
          ticketId={ticket.id}
          messages={messages.map((message) => ({
            id: message.id,
            senderType: message.senderType,
            message: message.message,
            createdAt: message.createdAt,
          }))}
          traderName={session.fullName}
          closed={ticket.status === "closed"}
        />
      </Panel>

      <p className="text-faint text-[0.78125rem]">
        Connect Funded will never ask for your platform password or a payment
        outside the portal. Anything that looks like it did is not from us —
        forward it to the desk and we will investigate.
      </p>
    </AppMain>
  );
}
