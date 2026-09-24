"use client";

import { Check, Loader2, Wallet, X } from "lucide-react";
import { useState, useTransition } from "react";

import { updatePayoutStatus } from "@/app/admin/actions";
import { RowError, rowBusyClass } from "@/components/admin/row-ui";
import type { PayoutStatus } from "@/components/admin/labels";
import { Td, Tr } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { payoutStatusLabels, payoutStatusTone } from "@/lib/trading";

export type PayoutRowData = {
  id: string;
  requestedLabel: string;
  requestedTitle: string;
  fullName: string;
  email: string;
  login: string;
  tierName: string;
  amountLabel: string;
  method: string | null;
  status: PayoutStatus;
  notes: string | null;
};

export function PayoutRow({ payout }: { payout: PayoutRowData }) {
  const [status, setStatus] = useState<PayoutStatus>(payout.status);
  const [target, setTarget] = useState<PayoutStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(next: Exclude<PayoutStatus, "requested">) {
    setError(null);
    setTarget(next);
    startTransition(async () => {
      const result = await updatePayoutStatus({
        payoutId: payout.id,
        status: next,
      });
      if (result.ok) setStatus(next);
      else setError(result.message);
      setTarget(null);
    });
  }

  const busy = (next: PayoutStatus) => pending && target === next;

  const settled = status === "paid" || status === "rejected";

  return (
    <Tr aria-busy={pending} className={rowBusyClass(pending)}>
      <Td
        className="text-muted tabular font-mono text-[0.78125rem] whitespace-nowrap"
        title={payout.requestedTitle}
      >
        {payout.requestedLabel}
      </Td>
      <Td>
        <span className="block truncate font-medium">{payout.fullName}</span>
        <a
          href={`mailto:${payout.email}`}
          className="text-faint hover:text-brand-light block truncate text-[0.78125rem] transition-colors"
        >
          {payout.email}
        </a>
      </Td>
      <Td className="whitespace-nowrap">
        <span className="tabular block font-mono text-[0.8125rem]">
          {payout.login}
        </span>
        <span className="text-faint block text-[0.78125rem]">
          {payout.tierName}
        </span>
      </Td>
      <Td className="font-display tabular text-[0.9375rem] font-semibold whitespace-nowrap">
        {payout.amountLabel}
      </Td>
      <Td className="text-muted text-[0.8125rem] whitespace-nowrap">
        {payout.method ?? "Not specified"}
      </Td>
      <Td>
        <Badge tone={payoutStatusTone[status]}>
          {payoutStatusLabels[status]}
        </Badge>
      </Td>
      <Td className="max-w-[14rem]">
        {payout.notes ? (
          <span
            className="text-muted block truncate text-[0.78125rem]"
            title={payout.notes}
          >
            {payout.notes}
          </span>
        ) : (
          <span className="text-faint text-[0.78125rem]">—</span>
        )}
      </Td>
      <Td>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="soft"
            disabled={pending || status !== "requested"}
            onClick={() => submit("processing")}
          >
            {busy("processing") ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="mint"
            disabled={pending || settled}
            onClick={() => submit("paid")}
          >
            {busy("paid") ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Wallet aria-hidden="true" />
            )}
            Mark paid
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || settled}
            onClick={() => submit("rejected")}
          >
            {busy("rejected") ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <X aria-hidden="true" />
            )}
            Reject
          </Button>
        </div>
        <span className="sr-only" aria-live="polite">
          {pending ? `Saving payout for ${payout.fullName}` : ""}
        </span>
        {error && <RowError message={error} className="max-w-[18rem]" />}
      </Td>
    </Tr>
  );
}
