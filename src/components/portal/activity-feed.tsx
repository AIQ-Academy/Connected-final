import Link from "next/link";
import {
  ArrowUpRight,
  CircleCheck,
  Clock,
  LifeBuoy,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import type { PortalPayout, PortalTicket } from "@/db/portal-queries";
import { formatDateTime, relativeTime } from "@/lib/trading";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "brand" | "mint" | "amber" | "loss";

type Item = {
  key: string;
  at: Date;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  detail: string;
  href?: string;
};

const toneClass: Record<Tone, string> = {
  brand: "border-brand/35 bg-brand/12 text-brand-light",
  mint: "border-mint/35 bg-mint/12 text-mint",
  amber: "border-amber/35 bg-amber/12 text-amber",
  loss: "border-loss/35 bg-loss/12 text-loss",
};

/** The last few things that happened across payouts and support, merged. */
export function ActivityFeed({
  payouts,
  tickets,
  limit = 6,
}: {
  payouts: PortalPayout[];
  tickets: PortalTicket[];
  limit?: number;
}) {
  const items: Item[] = [];

  for (const { payout, accountLogin } of payouts) {
    const amount = formatCurrency(payout.amount, { decimals: 2 });
    const method = payout.method ?? "your registered method";

    if (payout.status === "paid" && payout.processedAt) {
      items.push({
        key: `payout-${payout.id}`,
        at: payout.processedAt,
        icon: CircleCheck,
        tone: "mint",
        title: `${amount} paid out`,
        detail: `Released to ${method} from account ${accountLogin}.`,
      });
      continue;
    }

    if (payout.status === "rejected") {
      items.push({
        key: `payout-${payout.id}`,
        at: payout.processedAt ?? payout.requestedAt,
        icon: TriangleAlert,
        tone: "loss",
        title: `${amount} request declined`,
        detail:
          payout.notes ??
          `The desk could not release this request from account ${accountLogin}.`,
      });
      continue;
    }

    items.push({
      key: `payout-${payout.id}`,
      at: payout.requestedAt,
      icon: payout.status === "processing" ? Clock : Wallet,
      tone: payout.status === "processing" ? "brand" : "amber",
      title:
        payout.status === "processing"
          ? `${amount} in processing`
          : `${amount} payout requested`,
      detail:
        payout.status === "processing"
          ? `Approved and queued for release to ${method}.`
          : `Awaiting review by the desk on account ${accountLogin}.`,
    });
  }

  for (const { ticket, lastMessage } of tickets) {
    items.push({
      key: `ticket-${ticket.id}`,
      at: ticket.updatedAt,
      icon: LifeBuoy,
      tone: ticket.status === "closed" ? "brand" : "amber",
      title: `${ticket.reference} · ${ticket.subject}`,
      detail: lastMessage ? truncate(lastMessage, 110) : "No messages on this thread yet.",
      href: `/portal/support/${ticket.id}`,
    });
  }

  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  const visible = items.slice(0, limit);

  if (!visible.length) {
    return (
      <EmptyState
        icon={<Clock />}
        title="Nothing has happened yet"
        description="Payout releases, support replies and account milestones all appear here as soon as there is something to report."
        className="m-5 sm:m-6"
      />
    );
  }

  return (
    <ul className="divide-line-soft divide-y">
      {visible.map((item) => {
        const Icon = item.icon;

        const body = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border",
                toneClass[item.tone],
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="truncate text-[0.875rem] font-medium">
                  {item.title}
                </span>
                <time
                  dateTime={item.at.toISOString()}
                  title={formatDateTime(item.at)}
                  className="text-faint tabular shrink-0 text-[0.75rem]"
                >
                  {relativeTime(item.at)}
                </time>
              </span>
              <span className="text-muted mt-0.5 block text-[0.8125rem]">
                {item.detail}
              </span>
            </span>
          </>
        );

        return (
          <li key={item.key}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:bg-sunken/60 group flex items-start gap-3.5 px-5 py-3.5 transition-colors sm:px-6"
              >
                {body}
                <ArrowUpRight
                  className="text-faint group-hover:text-brand-light mt-1 size-3.5 shrink-0 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <div className="flex items-start gap-3.5 px-5 py-3.5 sm:px-6">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function truncate(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}
