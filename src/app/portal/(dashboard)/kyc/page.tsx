import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Circle,
  FileText,
  Lock,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { AppMain, PageHeader, Panel, PanelBody, PanelHeader } from "@/components/app/panel";
import { WorkspaceUnavailable } from "@/components/portal/workspace-unavailable";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import {
  formatDateTime,
  kycStatusLabels,
  kycStatusTone,
  relativeTime,
} from "@/lib/trading";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Verification" };

type KycStatus = "not_started" | "pending" | "verified" | "rejected";

export default async function PortalKycPage() {
  const session = await requireSession("/portal/kyc");
  const workspace = await loadWorkspace(session.userId);

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable surface="your verification record" />
      </AppMain>
    );
  }

  const { kyc, user } = workspace;
  const status: KycStatus = kyc?.status ?? "not_started";

  return (
    <AppMain>
      <PageHeader
        eyebrow="Verification"
        title="Identity verification"
        description="Regulation requires us to know who we pay. It is a one-time check, and it never touches your trading."
        action={
          <Badge tone={kycStatusTone[status]} size="md">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {kycStatusLabels[status]}
          </Badge>
        }
      />

      <Panel className="overflow-hidden">
        <StatusHero
          status={status}
          fullName={user.fullName}
          submittedAt={kyc?.submittedAt ?? null}
          reviewedAt={kyc?.reviewedAt ?? null}
        />

        <div className="border-line-soft border-t px-5 py-6 sm:px-6">
          <Stepper
            status={status}
            submittedAt={kyc?.submittedAt ?? null}
            reviewedAt={kyc?.reviewedAt ?? null}
          />
        </div>
      </Panel>

      {status === "rejected" && (
        <Panel className="border-loss/35">
          <PanelBody className="flex flex-col gap-3">
            <p className="text-loss flex items-center gap-2 text-[0.9375rem] font-medium">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              Your documents need to be resubmitted
            </p>
            <p className="text-muted text-[0.875rem]">
              {kyc?.rejectionReason ??
                "The compliance team could not confirm your identity from the documents provided. Support can tell you exactly what to send."}
            </p>
            <ButtonLink href="/portal/support" className="self-start">
              Message compliance
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </PanelBody>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Panel>
          <PanelHeader
            title="Document checklist"
            description="Two documents, reviewed by a person rather than an automated scan."
          />
          <ul className="divide-line-soft divide-y">
            <DocumentRow
              status={status}
              reviewedAt={kyc?.reviewedAt ?? null}
              title="Government photo identification"
              detail="Passport, national ID card or driving licence. All four corners visible, unedited, in colour."
            />
            <DocumentRow
              status={status}
              reviewedAt={kyc?.reviewedAt ?? null}
              title="Proof of address"
              detail="Bank statement or utility bill dated within the last three months, showing your name and residential address."
            />
          </ul>

          {status === "not_started" && (
            <PanelBody className="border-line-soft flex flex-col gap-3 border-t">
              <Button type="button" disabled className="self-start">
                <Upload aria-hidden="true" />
                Upload documents
              </Button>
              <p className="text-faint text-[0.78125rem]">
                Document upload opens once your evaluation fee is settled, so the
                compliance team only handles records for active accounts. If you
                have already paid and this control is still disabled, support can
                open it manually.
              </p>
            </PanelBody>
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="What verification unlocks" />
            <ul className="flex flex-col gap-3 px-5 py-5 text-[0.8125rem] sm:px-6">
              {[
                {
                  title: "Payout release",
                  body: "Funds cannot leave the firm until the receiving trader is verified.",
                },
                {
                  title: "Account transfers",
                  body: "Moving an evaluation to a different platform or size requires a verified profile.",
                },
                {
                  title: "Higher allocations",
                  body: "Scaling beyond the $200,000 Professional account is only offered to verified traders.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-2.5">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      status === "verified" ? "text-mint" : "text-faint",
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="text-muted block">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="How your documents are handled" />
            <PanelBody className="text-muted flex flex-col gap-2.5 text-[0.8125rem]">
              <p>
                Files are encrypted at rest and visible only to the compliance
                team. They are never shared with a broker, a liquidity provider
                or any marketing partner.
              </p>
              <p>
                Records are retained for five years after your last account
                closes, as required of us, then deleted.
              </p>
              <p className="text-faint flex items-start gap-2">
                <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                Support can never see your document images, only whether the
                check passed.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </AppMain>
  );
}

function StatusHero({
  status,
  fullName,
  submittedAt,
  reviewedAt,
}: {
  status: KycStatus;
  fullName: string;
  submittedAt: Date | null;
  reviewedAt: Date | null;
}) {
  if (status === "verified") {
    return (
      <div className="from-mint/12 relative bg-gradient-to-b to-transparent px-5 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="border-mint/45 bg-mint/12 relative grid size-14 place-items-center rounded-full border"
            aria-hidden="true"
          >
            <BadgeCheck className="text-mint size-7" />
          </span>
          <div>
            <h2 className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
              Verified
            </h2>
            <p className="text-muted mx-auto mt-2 max-w-md text-[0.875rem]">
              {fullName} is confirmed as the account holder. Payouts are released
              without any further identity checks, and there is nothing left for
              you to submit.
            </p>
          </div>
          <dl className="text-[0.78125rem] sm:flex sm:items-center sm:gap-6">
            <div className="flex items-center justify-center gap-2 py-1">
              <dt className="text-faint">Submitted</dt>
              <dd className="tabular">{formatDateTime(submittedAt)} UTC</dd>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <dt className="text-faint">Approved</dt>
              <dd className="tabular">{formatDateTime(reviewedAt)} UTC</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  const copy: Record<Exclude<KycStatus, "verified">, { title: string; body: string }> = {
    not_started: {
      title: "Verification has not started",
      body: "Nothing is overdue. We ask for documents once your evaluation fee is settled, and the review itself usually takes under a business day.",
    },
    pending: {
      title: "Your documents are with compliance",
      body: "A reviewer is checking the files you sent. Most decisions land within one business day, and you will see the result here and by email.",
    },
    rejected: {
      title: "We need a clearer set of documents",
      body: "Your account and balances are unaffected. Once compliance has a readable copy, verification usually completes the same day.",
    },
  };

  const tone = {
    not_started: "text-faint border-line bg-sunken",
    pending: "text-amber border-amber/40 bg-amber/12",
    rejected: "text-loss border-loss/40 bg-loss/12",
  }[status];

  return (
    <div className="flex flex-col gap-4 px-5 py-7 sm:flex-row sm:items-start sm:px-6">
      <span
        className={cn("grid size-12 shrink-0 place-items-center rounded-full border", tone)}
        aria-hidden="true"
      >
        <ShieldCheck className="size-6" />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.02em]">
          {copy[status].title}
        </h2>
        <p className="text-muted mt-1.5 max-w-xl text-[0.875rem]">{copy[status].body}</p>
        {submittedAt && (
          <p className="text-faint mt-2 text-[0.78125rem]">
            Submitted {formatDateTime(submittedAt)} UTC · {relativeTime(submittedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function Stepper({
  status,
  submittedAt,
  reviewedAt,
}: {
  status: KycStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
}) {
  const index = { not_started: 0, pending: 1, verified: 3, rejected: 2 }[status];

  const steps = [
    {
      title: "Submitted",
      blurb: "Photo ID and proof of address received.",
      at: submittedAt,
    },
    {
      title: "In review",
      blurb: "Checked by the compliance team against your profile.",
      at: status === "verified" || status === "rejected" ? reviewedAt : null,
    },
    {
      title: status === "rejected" ? "Action required" : "Verified",
      blurb:
        status === "rejected"
          ? "Resubmission needed before payouts can be released."
          : "Identity confirmed and payouts unrestricted.",
      at: status === "verified" ? reviewedAt : null,
    },
  ];

  return (
    <ol className="flex flex-col gap-5 sm:flex-row sm:gap-0">
      {steps.map((step, position) => {
        const complete = position < index;
        const current = position === index;
        const failed = status === "rejected" && position === 2;

        return (
          <li
            key={step.title}
            className="flex min-w-0 flex-1 gap-3.5 sm:flex-col sm:gap-0"
          >
            <div className="flex flex-col items-center sm:w-full sm:flex-row sm:gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border",
                  failed && "border-loss/50 bg-loss/15 text-loss",
                  !failed && complete && "border-mint/50 bg-mint/15 text-mint",
                  !failed && current && "border-brand bg-brand text-white",
                  !failed && !complete && !current && "border-line text-faint",
                )}
              >
                {complete ? (
                  <Check className="size-3.5" />
                ) : failed ? (
                  <TriangleAlert className="size-3.5" />
                ) : (
                  <Circle className={cn("size-2", current && "fill-current")} />
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "w-px flex-1 sm:h-px sm:w-auto",
                  position === steps.length - 1 ? "hidden" : "block",
                  complete ? "bg-mint/45" : "bg-line",
                )}
              />
            </div>

            <div className="min-w-0 pb-1 sm:mt-3 sm:pe-6">
              <p
                className={cn(
                  "text-[0.875rem] font-medium",
                  failed && "text-loss",
                  !failed && !complete && !current && "text-faint",
                )}
              >
                {step.title}
              </p>
              <p className="text-muted mt-0.5 text-[0.78125rem]">{step.blurb}</p>
              <p className="text-faint tabular mt-1 text-[0.75rem]">
                {step.at
                  ? `${formatDateTime(step.at)} UTC`
                  : failed
                    ? "Awaiting your resubmission"
                    : current
                      ? status === "not_started"
                        ? "Waiting on your documents"
                        : "In progress"
                      : "Not reached"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DocumentRow({
  status,
  reviewedAt,
  title,
  detail,
}: {
  status: KycStatus;
  reviewedAt: Date | null;
  title: string;
  detail: string;
}) {
  const state = {
    not_started: { label: "Awaiting upload", tone: "neutral" as const },
    pending: { label: "In review", tone: "amber" as const },
    verified: { label: "Accepted", tone: "mint" as const },
    rejected: { label: "Needs replacement", tone: "loss" as const },
  }[status];

  return (
    <li className="flex items-start gap-3.5 px-5 py-4 sm:px-6">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border",
          status === "verified"
            ? "border-mint/40 bg-mint/12 text-mint"
            : "border-line-soft bg-sunken text-faint",
        )}
        aria-hidden="true"
      >
        <FileText className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.875rem] font-medium">{title}</p>
          <Badge tone={state.tone}>{state.label}</Badge>
        </div>
        <p className="text-muted mt-1 text-[0.8125rem]">{detail}</p>
        {status === "verified" && reviewedAt && (
          <p className="text-faint tabular mt-1 text-[0.75rem]">
            Accepted {formatDateTime(reviewedAt)} UTC
          </p>
        )}
      </div>
    </li>
  );
}
