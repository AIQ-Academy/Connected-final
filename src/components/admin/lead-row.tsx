"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { updateLeadStatus } from "@/app/admin/actions";
import {
  RowError,
  rowBusyClass,
  rowSelectChevron,
  rowSelectClass,
} from "@/components/admin/row-ui";
import {
  leadStatusLabels,
  leadStatusOrder,
  sourceLabel,
  sourceTone,
  type LeadStatus,
} from "@/components/admin/labels";
import { Td, Tr } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { leadStatusTone } from "@/lib/trading";
import { cn } from "@/lib/utils";

export type LeadRowData = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  source: string | null;
  tierLabel: string | null;
  status: LeadStatus;
  createdLabel: string;
  createdTitle: string;
  notes: string | null;
};

export function LeadRow({ lead }: { lead: LeadRowData }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: LeadStatus) {
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await updateLeadStatus({ leadId: lead.id, status: next });
      if (!result.ok) {
        setStatus(previous);
        setError(result.message);
      }
    });
  }

  return (
    <Tr aria-busy={pending} className={rowBusyClass(pending)}>
      <Td>
        <span className="block font-medium">{lead.fullName}</span>
        <a
          href={`mailto:${lead.email}`}
          className="text-faint hover:text-brand-light block text-[0.78125rem] transition-colors"
        >
          {lead.email}
        </a>
      </Td>
      <Td className="text-muted tabular font-mono text-[0.78125rem] whitespace-nowrap">
        {lead.phone ?? "—"}
      </Td>
      <Td className="text-muted text-[0.8125rem] whitespace-nowrap">
        {lead.country ?? "—"}
      </Td>
      <Td>
        <Badge tone={sourceTone(lead.source)}>{sourceLabel(lead.source)}</Badge>
      </Td>
      <Td className="text-muted text-[0.8125rem] whitespace-nowrap">
        {lead.tierLabel ?? "Undecided"}
      </Td>
      <Td
        className="text-faint text-[0.78125rem] whitespace-nowrap"
        title={lead.createdTitle}
      >
        {lead.createdLabel}
      </Td>
      <Td className="max-w-[16rem]">
        {lead.notes ? (
          <span
            className="text-muted block truncate text-[0.78125rem]"
            title={lead.notes}
          >
            {lead.notes}
          </span>
        ) : (
          <span className="text-faint text-[0.78125rem]">No notes</span>
        )}
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Badge tone={leadStatusTone[status]} className="hidden xl:inline-flex">
            {leadStatusLabels[status]}
          </Badge>
          <div className="relative">
            <select
              value={status}
              disabled={pending}
              aria-label={`Pipeline status for ${lead.fullName}`}
              onChange={(event) => change(event.target.value as LeadStatus)}
              className={cn(rowSelectClass, error && "border-loss/70")}
              style={rowSelectChevron}
            >
              {leadStatusOrder.map((option) => (
                <option key={option} value={option}>
                  {leadStatusLabels[option]}
                </option>
              ))}
            </select>
            {pending && (
              <Loader2
                className="text-brand-light absolute top-1/2 end-8 size-3.5 -translate-y-1/2 animate-spin"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {pending ? `Saving status for ${lead.fullName}` : ""}
        </span>
        {error && <RowError message={error} className="max-w-[16rem]" />}
      </Td>
    </Tr>
  );
}
