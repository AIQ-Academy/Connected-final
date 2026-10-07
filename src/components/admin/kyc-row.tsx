"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { updateKycStatus } from "@/app/admin/actions";
import { RowError, rowBusyClass } from "@/components/admin/row-ui";
import { initials, type KycStatus } from "@/components/admin/labels";
import { Td, Tr } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kycStatusLabels, kycStatusTone } from "@/lib/trading";

export type KycRowData = {
  id: string;
  fullName: string;
  email: string;
  country: string | null;
  status: KycStatus;
  submittedLabel: string;
  reviewedLabel: string;
  rejectionReason: string | null;
};

export function KycRow({ row }: { row: KycRowData }) {
  const [status, setStatus] = useState<KycStatus>(row.status);
  const [reason, setReason] = useState(row.rejectionReason ?? "");
  const [rejecting, setRejecting] = useState(false);
  const [target, setTarget] = useState<KycStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reasonRef = useRef<HTMLInputElement>(null);

  function submit(next: KycStatus, rejectionReason?: string) {
    setError(null);
    setTarget(next);
    startTransition(async () => {
      const result = await updateKycStatus({
        kycId: row.id,
        status: next,
        rejectionReason,
      });
      if (result.ok) {
        setStatus(next);
        setRejecting(false);
      } else {
        setError(result.message);
      }
      setTarget(null);
    });
  }

  return (
    <Tr aria-busy={pending} className={rowBusyClass(pending)}>
      <Td>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="bg-brand-dim text-brand-light font-display grid size-9 shrink-0 place-items-center rounded-full text-[0.75rem] font-semibold"
          >
            {initials(row.fullName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{row.fullName}</span>
            <a
              href={`mailto:${row.email}`}
              className="text-faint hover:text-brand-light block truncate text-[0.78125rem] transition-colors"
            >
              {row.email}
            </a>
          </span>
        </div>
      </Td>
      <Td className="text-muted text-[0.8125rem] whitespace-nowrap">
        {row.country ?? "—"}
      </Td>
      <Td>
        <Badge tone={kycStatusTone[status]}>{kycStatusLabels[status]}</Badge>
      </Td>
      <Td className="text-muted tabular font-mono text-[0.78125rem] whitespace-nowrap">
        {row.submittedLabel}
      </Td>
      <Td className="text-muted tabular font-mono text-[0.78125rem] whitespace-nowrap">
        {row.reviewedLabel}
      </Td>
      <Td className="max-w-[14rem]">
        {status === "rejected" && (row.rejectionReason || reason) ? (
          <span
            className="text-loss block truncate text-[0.78125rem]"
            title={reason || (row.rejectionReason ?? "")}
          >
            {reason || row.rejectionReason}
          </span>
        ) : (
          <span className="text-faint text-[0.78125rem]">—</span>
        )}
      </Td>
      <Td>
        {rejecting ? (
          <form
            className="w-64"
            onSubmit={(event) => {
              event.preventDefault();
              submit("rejected", reason.trim());
            }}
          >
            <label
              htmlFor={`kyc-reason-${row.id}`}
              className="text-faint mb-1 block text-[0.75rem]"
            >
              Reason sent to the trader
            </label>
            <input
              id={`kyc-reason-${row.id}`}
              ref={reasonRef}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Document expired, resubmit a valid ID"
              className="border-line bg-raised text-ink placeholder:text-faint focus:border-brand-light h-9 w-full rounded-lg border px-3 text-[0.8125rem] outline-none focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]"
            />
            <div className="mt-2 flex items-center gap-2">
              <Button type="submit" size="sm" variant="danger" disabled={pending}>
                {pending && target === "rejected" ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <X aria-hidden="true" />
                )}
                Confirm rejection
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRejecting(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="mint"
              disabled={pending || status === "verified"}
              onClick={() => submit("verified")}
            >
              {pending && target === "verified" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setRejecting(true);
                setError(null);
                requestAnimationFrame(() => reasonRef.current?.focus());
              }}
            >
              Reject
            </Button>
          </div>
        )}
        <span className="sr-only" aria-live="polite">
          {pending ? `Saving verification for ${row.fullName}` : ""}
        </span>
        {error && <RowError message={error} className="max-w-[16rem]" />}
      </Td>
    </Tr>
  );
}
