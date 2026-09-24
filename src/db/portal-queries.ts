import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getDb, hasDatabase } from "@/db";
import {
  accountTiers,
  kycVerifications,
  payouts,
  supportTickets,
  ticketMessages,
  tradingAccounts,
  users,
  type AccountTier,
  type Payout,
  type SupportTicket,
  type TradingAccount,
  type User,
} from "@/db/schema";

export type KycVerification = typeof kycVerifications.$inferSelect;
export type TicketMessage = typeof ticketMessages.$inferSelect;

export type PortalAccount = { account: TradingAccount; tier: AccountTier };

export type PortalPayout = {
  payout: Payout;
  accountLogin: string;
  tierName: string;
};

export type PortalTicket = {
  ticket: SupportTicket;
  lastMessage: string | null;
  messageCount: number;
};

export type TraderWorkspace = {
  user: User;
  accounts: PortalAccount[];
  payouts: PortalPayout[];
  kyc: KycVerification | null;
  tickets: PortalTicket[];
};

/**
 * Everything the client portal renders for one trader, in four round trips.
 * A brand-new registration returns empty collections rather than null, so
 * every portal surface has a real empty state to render.
 */
export async function getTraderWorkspace(
  userId: string,
): Promise<TraderWorkspace | null> {
  if (!hasDatabase()) return null;

  try {
    const db = getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null;

    const accountRows = await db
      .select({ account: tradingAccounts, tier: accountTiers })
      .from(tradingAccounts)
      .innerJoin(accountTiers, eq(tradingAccounts.tierId, accountTiers.id))
      .where(eq(tradingAccounts.userId, userId))
      .orderBy(desc(tradingAccounts.createdAt));

    const accountIds = accountRows.map((row) => row.account.id);

    const payoutRows = accountIds.length
      ? await db
          .select({
            payout: payouts,
            accountLogin: tradingAccounts.login,
            tierName: accountTiers.name,
          })
          .from(payouts)
          .innerJoin(
            tradingAccounts,
            eq(payouts.tradingAccountId, tradingAccounts.id),
          )
          .innerJoin(accountTiers, eq(tradingAccounts.tierId, accountTiers.id))
          .where(inArray(payouts.tradingAccountId, accountIds))
          .orderBy(desc(payouts.requestedAt))
      : [];

    const [kycRow] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .limit(1);

    const ticketRows = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.updatedAt));

    const ticketIds = ticketRows.map((t) => t.id);
    const messageRows = ticketIds.length
      ? await db
          .select()
          .from(ticketMessages)
          .where(inArray(ticketMessages.ticketId, ticketIds))
          .orderBy(asc(ticketMessages.createdAt))
      : [];

    const tickets: PortalTicket[] = ticketRows.map((ticket) => {
      const messages = messageRows.filter((m) => m.ticketId === ticket.id);
      return {
        ticket,
        lastMessage: messages.at(-1)?.message ?? null,
        messageCount: messages.length,
      };
    });

    return { user, accounts: accountRows, payouts: payoutRows, kyc: kycRow ?? null, tickets };
  } catch (error) {
    console.error("[db] getTraderWorkspace failed", error);
    return null;
  }
}

export async function getTicketThread(ticketId: string, userId: string) {
  if (!hasDatabase()) return null;

  try {
    const db = getDb();
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(
        and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, userId)),
      )
      .limit(1);
    if (!ticket) return null;

    const messages = await db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticket.id))
      .orderBy(asc(ticketMessages.createdAt));

    return { ticket, messages };
  } catch (error) {
    console.error("[db] getTicketThread failed", error);
    return null;
  }
}

/** Login lookup. Returns the password hash, so never expose the result. */
export async function findUserByEmail(email: string): Promise<User | null> {
  if (!hasDatabase()) return null;
  try {
    const [user] = await getDb()
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);
    return user ?? null;
  } catch (error) {
    console.error("[db] findUserByEmail failed", error);
    return null;
  }
}
