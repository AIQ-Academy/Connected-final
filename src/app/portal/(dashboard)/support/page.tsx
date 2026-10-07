import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, LifeBuoy, MessageSquare } from "lucide-react";

import { AppMain, PageHeader, Panel, PanelBody, PanelHeader } from "@/components/app/panel";
import { EmptyState } from "@/components/app/empty-state";
import { WorkspaceUnavailable } from "@/components/portal/workspace-unavailable";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { SupportTicket } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { formatDate, relativeTime, ticketStatusTone } from "@/lib/trading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Support" };

const statusLabels: Record<SupportTicket["status"], string> = {
  open: "Open",
  pending: "In progress",
  closed: "Closed",
};

const priorityTone: Record<SupportTicket["priority"], "neutral" | "amber" | "loss"> = {
  low: "neutral",
  medium: "neutral",
  high: "loss",
};

export default async function PortalSupportPage() {
  const session = await requireSession("/portal/support");
  const workspace = await loadWorkspace(session.userId);

  if (!workspace) {
    return (
      <AppMain>
        <WorkspaceUnavailable surface="your support conversations" />
      </AppMain>
    );
  }

  const { tickets } = workspace;
  const open = tickets.filter(({ ticket }) => ticket.status !== "closed");

  return (
    <AppMain>
      <PageHeader
        eyebrow="Support"
        title="Talk to the desk"
        description="Every conversation you have had with Connect Funded, in one thread per subject. Replies land here and in your inbox."
        action={
          <ButtonLink href="/contact" variant="soft">
            Start a new conversation
            <ArrowUpRight aria-hidden="true" />
          </ButtonLink>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Panel>
          <PanelHeader
            title="Your conversations"
            description={
              tickets.length
                ? `${open.length} open, ${tickets.length - open.length} closed.`
                : "Nothing raised yet."
            }
          />

          {tickets.length === 0 ? (
            <EmptyState
              className="m-5 sm:m-6"
              icon={<MessageSquare />}
              title="No conversations yet"
              description="Nothing needs your attention. When you contact the desk about an evaluation, a payout or your platform, the thread appears here so you can follow it."
              action={
                <ButtonLink href="/contact">
                  Contact the desk
                  <ArrowRight aria-hidden="true" />
                </ButtonLink>
              }
            />
          ) : (
            <ul className="divide-line-soft divide-y">
              {tickets.map(({ ticket, lastMessage, messageCount }) => (
                <li key={ticket.id}>
                  <Link
                    href={`/portal/support/${ticket.id}`}
                    className="hover:bg-sunken/60 group flex flex-col gap-2.5 px-5 py-4 transition-colors sm:px-6"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-faint font-mono text-[0.75rem]">
                        {ticket.reference}
                      </span>
                      <Badge tone={ticketStatusTone[ticket.status]}>
                        {statusLabels[ticket.status]}
                      </Badge>
                      {ticket.priority !== "low" && (
                        <Badge tone={priorityTone[ticket.priority]}>
                          {ticket.priority} priority
                        </Badge>
                      )}
                      <span className="text-faint tabular ms-auto text-[0.75rem]">
                        {relativeTime(ticket.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="group-hover:text-brand-light text-[0.9375rem] font-medium transition-colors">
                          {ticket.subject}
                        </p>
                        {lastMessage && (
                          <p className="text-muted mt-1 line-clamp-2 text-[0.8125rem]">
                            {lastMessage}
                          </p>
                        )}
                        <p className="text-faint mt-1.5 text-[0.75rem]">
                          {messageCount} message{messageCount === 1 ? "" : "s"}
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          Opened {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <ArrowRight
                        className="text-faint group-hover:text-brand-light mt-1 size-4 shrink-0 transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="Response times" />
            <PanelBody className="flex flex-col gap-3 text-[0.8125rem]">
              {[
                ["First response", "Under two hours, median"],
                ["Payout questions", "Same business day"],
                ["Rule and breach reviews", "Within one business day"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-line-soft flex items-center justify-between gap-3 border-b pb-2.5 last:border-0 last:pb-0"
                >
                  <span className="text-muted">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <p className="text-faint text-[0.78125rem]">
                The desk is staffed 24 hours a day from Monday to Friday, and on
                weekends for anything that blocks trading or a payout.
              </p>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Before you write" />
            <PanelBody className="text-muted flex flex-col gap-2.5 text-[0.8125rem]">
              <p>
                Include the account login when a question relates to a specific
                account. It saves an exchange and gets you a definitive answer
                first time.
              </p>
              <p>
                Rule questions are usually answered faster by the published
                rulebook, which is the same document the desk applies.
              </p>
              <ButtonLink
                href="/faq"
                variant="ghost"
                size="sm"
                className="self-start"
              >
                <LifeBuoy aria-hidden="true" />
                Read the rulebook
              </ButtonLink>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </AppMain>
  );
}
