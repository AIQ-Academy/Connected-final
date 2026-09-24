/**
 * Presentation vocabulary for the operations desk. Shared by the server pages
 * and the client row controls, so a status reads identically wherever it is
 * rendered.
 */

import { formatCompactCurrency } from "@/lib/utils";

export type Tone = "neutral" | "brand" | "mint" | "amber" | "loss";

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
export type KycStatus = "not_started" | "pending" | "verified" | "rejected";
export type TicketStatus = "open" | "pending" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type PayoutStatus = "requested" | "processing" | "paid" | "rejected";

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export const leadStatusOrder: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

export const leadSourceLabels: Record<string, string> = {
  registration: "Registration",
  contact_form: "Contact form",
  ai_chatbot: "AI assistant",
  newsletter: "Newsletter",
};

export const leadSourceTone: Record<string, Tone> = {
  registration: "brand",
  contact_form: "neutral",
  ai_chatbot: "mint",
  newsletter: "amber",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Awaiting trader",
  closed: "Closed",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const ticketPriorityTone: Record<TicketPriority, Tone> = {
  low: "neutral",
  medium: "brand",
  high: "loss",
};

export function sourceLabel(source: string | null | undefined) {
  if (!source) return "Direct";
  return leadSourceLabels[source] ?? titleCase(source);
}

export function sourceTone(source: string | null | undefined): Tone {
  if (!source) return "neutral";
  return leadSourceTone[source] ?? "neutral";
}

export type TierLookup = { code: string; name: string; accountSize: number };

/**
 * Registration stores the tier *code* on the lead. The desk needs the product
 * name and the capital behind it, not `growth`.
 */
export function tierLabel(
  code: string | null | undefined,
  tiers: TierLookup[],
): string | null {
  if (!code) return null;
  const tier = tiers.find((t) => t.code === code);
  if (!tier) return titleCase(code);
  return `${tier.name} · ${formatCompactCurrency(Number(tier.accountSize))}`;
}

export function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "—"
  );
}
