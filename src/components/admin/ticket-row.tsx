"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { updateTicketStatus } from "@/app/admin/actions";
import { RowError, rowBusyClass } from "@/components/admin/row-ui";
import {
  ticketPriorityLabels,
  ticketPriorityTone,
  ticketStatusLabels,
  type TicketPriority,
  type TicketStatus,
} from "@/components/admin/labels";
import { Td, Tr } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { ticketStatusTone } from "@/lib/trading";
import { cn } from "@/lib/utils";

export type TicketRowData = {
  id: string;
  reference: string;
  subject: string;
  fullName: string;
  email: string;
  priority: TicketPriority;
  status: TicketStatus;
  messageCount: number;
  updatedLabel: string;
  updatedTitle: string;
};

const statusOptions: TicketStatus[] = ["open", "pending", "closed"];

export function TicketRow({ ticket }: { ticket: TicketRowData }) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: TicketStatus) {
    if (next === status) return;
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await updateTicketStatus({
        ticketId: ticket.id,
        status: next,
      });
      if (!result.ok) {
        setStatus(previous);
        setError(result.message);
      }
    });
  }

  return (
    <Tr aria-busy={pending} className={rowBusyClass(pending)}>
      <Td className="text-brand-light font-mono text-[0.78125rem] whitespace-nowrap">
        {ticket.reference}
      </Td>
      <Td className="max-w-[18rem]">
        <span className="block truncate font-medium" title={ticket.subject}>
          {ticket.subject}
        </span>
      </Td>
      <Td>
        <span className="block truncate text-[0.8125rem]">{ticket.fullName}</span>
        <a
          href={`mailto:${ticket.email}`}
          className="text-faint hover:text-brand-light block truncate text-[0.78125rem] transition-colors"
        >
          {ticket.email}
        </a>
      </Td>
      <Td>
        <Badge tone={ticketPriorityTone[ticket.priority]}>
          {ticketPriorityLabels[ticket.priority]}
        </Badge>
      </Td>
      <Td>
        <Badge tone={ticketStatusTone[status]}>{ticketStatusLabels[status]}</Badge>
      </Td>
      <Td className="text-muted tabular text-center font-mono text-[0.8125rem]">
        {ticket.messageCount}
      </Td>
      <Td
        className="text-faint text-[0.78125rem] whitespace-nowrap"
        title={ticket.updatedTitle}
      >
        {ticket.updatedLabel}
      </Td>
      <Td>
        <div
          role="group"
          aria-label={`Status for ticket ${ticket.reference}`}
          className="border-line bg-sunken inline-flex rounded-lg border p-0.5"
        >
          {statusOptions.map((option) => {
            const active = option === status;
            return (
              <button
                key={option}
                type="button"
                disabled={pending}
                aria-pressed={active}
                onClick={() => change(option)}
                className={cn(
                  "rounded-[6px] px-2.5 py-1.5 text-[0.75rem] transition-colors disabled:opacity-60",
                  active
                    ? "bg-brand text-white"
                    : "text-muted hover:text-ink hover:bg-raised",
                )}
              >
                {option === "pending" ? "Awaiting" : ticketStatusLabels[option]}
              </button>
            );
          })}
        </div>
        {pending && (
          <Loader2
            className="text-brand-light ml-2 inline size-3.5 animate-spin align-middle"
            aria-hidden="true"
          />
        )}
        <span className="sr-only" aria-live="polite">
          {pending ? `Saving ticket ${ticket.reference}` : ""}
        </span>
        {error && <RowError message={error} className="max-w-[16rem]" />}
      </Td>
    </Tr>
  );
}
