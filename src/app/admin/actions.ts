"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import {
  crmLeads,
  kycVerifications,
  payouts,
  supportTickets,
} from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth";
import { leadStatuses } from "@/lib/validation/lead";

/**
 * Every desk mutation returns rather than throws, so the row that triggered it
 * can render the failure next to the control the operator just used.
 */
export type AdminActionResult = { ok: true } | { ok: false; message: string };

const OFFLINE: AdminActionResult = {
  ok: false,
  message: "The operations database is unreachable. Try again in a moment.",
};

const GONE: AdminActionResult = {
  ok: false,
  message: "That record is no longer in the queue. Refresh to see the latest.",
};

function invalid(error: z.ZodError): AdminActionResult {
  return {
    ok: false,
    message: error.issues[0]?.message ?? "That request was not valid.",
  };
}

function failed(label: string, error: unknown): AdminActionResult {
  console.error(`[admin] ${label} failed`, error);
  return {
    ok: false,
    message: "We could not save that change. Try again in a moment.",
  };
}

/* ---------------------------------------------------------------- leads -- */

const leadInput = z.object({
  leadId: z.uuid("That lead reference is not valid."),
  status: z.enum(leadStatuses),
});

export async function updateLeadStatus(input: {
  leadId: string;
  status: string;
}): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  const parsed = leadInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  if (!hasDatabase()) return OFFLINE;

  const { leadId, status } = parsed.data;

  try {
    const [row] = await getDb()
      .update(crmLeads)
      .set({ status, updatedAt: new Date() })
      .where(eq(crmLeads.id, leadId))
      .returning({ id: crmLeads.id, email: crmLeads.email });

    if (!row) return GONE;

    await recordAudit({
      actorId: session.userId,
      action: "admin.lead.status_updated",
      entityType: "crm_lead",
      entityId: leadId,
      metadata: { status, email: row.email },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    return failed("updateLeadStatus", error);
  }
}

/* ------------------------------------------------------------------ kyc -- */

const kycInput = z
  .object({
    kycId: z.uuid("That verification reference is not valid."),
    status: z.enum(["verified", "rejected"]),
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      value.status !== "rejected" || (value.rejectionReason?.length ?? 0) >= 5,
    {
      path: ["rejectionReason"],
      message: "Give the trader a reason of at least five characters.",
    },
  );

export async function updateKycStatus(input: {
  kycId: string;
  status: string;
  rejectionReason?: string;
}): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  const parsed = kycInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  if (!hasDatabase()) return OFFLINE;

  const { kycId, status, rejectionReason } = parsed.data;

  try {
    const [row] = await getDb()
      .update(kycVerifications)
      .set({
        status,
        reviewedAt: new Date(),
        reviewedBy: session.userId,
        rejectionReason: status === "rejected" ? (rejectionReason ?? null) : null,
      })
      .where(eq(kycVerifications.id, kycId))
      .returning({ id: kycVerifications.id, userId: kycVerifications.userId });

    if (!row) return GONE;

    await recordAudit({
      actorId: session.userId,
      action:
        status === "verified" ? "admin.kyc.approved" : "admin.kyc.rejected",
      entityType: "kyc_verification",
      entityId: kycId,
      metadata: {
        status,
        traderId: row.userId,
        ...(status === "rejected" ? { rejectionReason } : {}),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/kyc");
    return { ok: true };
  } catch (error) {
    return failed("updateKycStatus", error);
  }
}

/* -------------------------------------------------------------- support -- */

const ticketInput = z.object({
  ticketId: z.uuid("That ticket reference is not valid."),
  status: z.enum(["open", "pending", "closed"]),
});

export async function updateTicketStatus(input: {
  ticketId: string;
  status: string;
}): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  const parsed = ticketInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  if (!hasDatabase()) return OFFLINE;

  const { ticketId, status } = parsed.data;

  try {
    const [row] = await getDb()
      .update(supportTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning({
        id: supportTickets.id,
        reference: supportTickets.reference,
      });

    if (!row) return GONE;

    await recordAudit({
      actorId: session.userId,
      action: "admin.ticket.status_updated",
      entityType: "support_ticket",
      entityId: ticketId,
      metadata: { status, reference: row.reference },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/support");
    return { ok: true };
  } catch (error) {
    return failed("updateTicketStatus", error);
  }
}

/* -------------------------------------------------------------- payouts -- */

const payoutInput = z.object({
  payoutId: z.uuid("That payout reference is not valid."),
  status: z.enum(["processing", "paid", "rejected"]),
  notes: z.string().trim().max(500).optional(),
});

export async function updatePayoutStatus(input: {
  payoutId: string;
  status: string;
  notes?: string;
}): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  const parsed = payoutInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  if (!hasDatabase()) return OFFLINE;

  const { payoutId, status, notes } = parsed.data;

  try {
    const [row] = await getDb()
      .update(payouts)
      .set({
        status,
        // Only a settled payout carries a processing timestamp; approving or
        // rejecting leaves it null so treasury can still see what is open.
        processedAt: status === "paid" ? new Date() : null,
        ...(notes ? { notes } : {}),
      })
      .where(eq(payouts.id, payoutId))
      .returning({
        id: payouts.id,
        amount: payouts.amount,
        tradingAccountId: payouts.tradingAccountId,
      });

    if (!row) return GONE;

    await recordAudit({
      actorId: session.userId,
      action: `admin.payout.${status}`,
      entityType: "payout",
      entityId: payoutId,
      metadata: {
        status,
        amount: Number(row.amount),
        tradingAccountId: row.tradingAccountId,
        ...(notes ? { notes } : {}),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/payouts");
    return { ok: true };
  } catch (error) {
    return failed("updatePayoutStatus", error);
  }
}
