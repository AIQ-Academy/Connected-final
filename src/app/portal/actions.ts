"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import {
  payouts,
  supportTickets,
  ticketMessages,
  tradingAccounts,
} from "@/db/schema";
import { MIN_PAYOUT, payoutMethods } from "@/components/portal/payout-methods";
import { recordAudit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

const OFFLINE =
  "We cannot reach your account data right now. Nothing was submitted — try again in a moment.";

const GENERIC =
  "We could not complete that request. Try again, and contact the desk if it keeps happening.";

/* -------------------------------------------------------------------------
 * Payout requests
 * ---------------------------------------------------------------------- */

const payoutSchema = z.object({
  accountId: z.uuid({ error: "Choose the account you want to withdraw from." }),
  amount: z
    .number({ error: "Enter the amount you want to withdraw." })
    .positive({ error: "Enter an amount greater than zero." })
    .min(MIN_PAYOUT, {
      error: `The minimum payout request is ${formatCurrency(MIN_PAYOUT)}.`,
    }),
  method: z.enum(payoutMethods, {
    error: "Choose how you would like to be paid.",
  }),
});

export async function requestPayout(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = payoutSchema.safeParse({
    accountId: formData.get("accountId"),
    amount: toAmount(formData.get("amount")),
    method: formData.get("method"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? GENERIC,
    };
  }

  const { accountId, method } = parsed.data;
  const amount = Math.round(parsed.data.amount * 100) / 100;

  if (!hasDatabase()) return { ok: false, message: OFFLINE };

  try {
    const db = getDb();

    // Ownership is re-established from the session, never from the form.
    const [account] = await db
      .select()
      .from(tradingAccounts)
      .where(
        and(
          eq(tradingAccounts.id, accountId),
          eq(tradingAccounts.userId, session.userId),
        ),
      )
      .limit(1);

    if (!account) {
      return {
        ok: false,
        message: "We could not find that trading account on your profile.",
      };
    }

    if (account.status !== "funded") {
      return {
        ok: false,
        message:
          "Payouts are only available on funded accounts. This account is still in evaluation or on hold.",
      };
    }

    const available = account.currentBalance - account.startingBalance;

    if (available < MIN_PAYOUT) {
      return {
        ok: false,
        message: `Account ${account.login} has ${formatCurrency(Math.max(0, available), { decimals: 2 })} of withdrawable profit, below the ${formatCurrency(MIN_PAYOUT)} minimum.`,
      };
    }

    // Tolerance covers the cent of float drift a rounded input can introduce.
    if (amount > available + 0.005) {
      return {
        ok: false,
        message: `The most you can withdraw from ${account.login} today is ${formatCurrency(available, { decimals: 2 })}.`,
      };
    }

    const [payout] = await db
      .insert(payouts)
      .values({
        tradingAccountId: account.id,
        amount,
        status: "requested",
        method,
      })
      .returning();

    await recordAudit({
      actorId: session.userId,
      action: "payout.requested",
      entityType: "payout",
      entityId: payout.id,
      metadata: {
        amount,
        method,
        accountLogin: account.login,
        source: "client_portal",
      },
    });

    revalidatePath("/portal/payouts");
    revalidatePath("/portal");

    return {
      ok: true,
      message: `Request for ${formatCurrency(amount, { decimals: 2 })} from ${account.login} is with the desk. You will see it move to processing once it is approved.`,
    };
  } catch (error) {
    console.error("[portal] requestPayout failed", error);
    return { ok: false, message: GENERIC };
  }
}

/* -------------------------------------------------------------------------
 * Support replies
 * ---------------------------------------------------------------------- */

const replySchema = z.object({
  ticketId: z.uuid({ error: "We could not identify that conversation." }),
  message: z
    .string({ error: "Write a message before sending." })
    .trim()
    .min(2, { error: "Write a message before sending." })
    .max(4000, {
      error: "Messages are limited to 4,000 characters. Send it in two parts.",
    }),
});

export async function replyToTicket(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? GENERIC };
  }

  const { ticketId, message } = parsed.data;

  if (!hasDatabase()) return { ok: false, message: OFFLINE };

  try {
    const db = getDb();

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.id, ticketId),
          eq(supportTickets.userId, session.userId),
        ),
      )
      .limit(1);

    if (!ticket) {
      return {
        ok: false,
        message: "We could not find that conversation on your profile.",
      };
    }

    const [inserted] = await db
      .insert(ticketMessages)
      .values({
        ticketId: ticket.id,
        senderType: "user",
        senderId: session.userId,
        message,
      })
      .returning();

    const reopened = ticket.status === "closed";

    await db
      .update(supportTickets)
      .set({
        status: reopened ? "pending" : ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, ticket.id));

    await recordAudit({
      actorId: session.userId,
      action: reopened ? "ticket.reopened" : "ticket.replied",
      entityType: "support_ticket",
      entityId: ticket.id,
      metadata: {
        reference: ticket.reference,
        messageId: inserted.id,
        characters: message.length,
        source: "client_portal",
      },
    });

    revalidatePath(`/portal/support/${ticket.id}`);
    revalidatePath("/portal/support");
    revalidatePath("/portal");

    return {
      ok: true,
      message: reopened
        ? "Your reply reopened the conversation and it is back with the desk."
        : "Your reply is with the desk.",
    };
  } catch (error) {
    console.error("[portal] replyToTicket failed", error);
    return { ok: false, message: GENERIC };
  }
}

/** Accepts "1,250.40" or "$1,250.40" and rejects anything that is not a number. */
function toAmount(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return Number.NaN;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return Number.NaN;
  return Number(cleaned);
}
