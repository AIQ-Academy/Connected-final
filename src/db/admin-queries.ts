import "server-only";

import { desc, eq, inArray, ne, sql } from "drizzle-orm";

import { getDb, hasDatabase } from "@/db";
import {
  accountTiers,
  crmLeads,
  kycVerifications,
  payouts,
  supportTickets,
  ticketMessages,
  tradingAccounts,
  users,
  type CrmLead,
  type Payout,
  type SupportTicket,
  type TradingAccount,
  type User,
} from "@/db/schema";
import type { KycVerification } from "@/db/portal-queries";

export type AdminKpis = {
  totalTraders: number;
  fundedAccounts: number;
  accountsInEvaluation: number;
  capitalAllocated: number;
  payoutsPaid: number;
  payoutsPending: number;
  openTickets: number;
  kycPending: number;
  newLeads: number;
  signupsLast7Days: number;
};

export type SignupRow = {
  user: User;
  interestedTier: string | null;
  leadSource: string | null;
};

export type LeadRow = CrmLead;

export type KycRow = { kyc: KycVerification; user: User };

export type TicketRow = {
  ticket: SupportTicket;
  user: User;
  messageCount: number;
};

export type PayoutRow = {
  payout: Payout;
  account: TradingAccount;
  user: User;
  tierName: string;
};

async function safely<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!hasDatabase()) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error(`[db] ${label} failed`, error);
    return fallback;
  }
}

export async function getAdminKpis(): Promise<AdminKpis | null> {
  return safely(
    "getAdminKpis",
    async () => {
      const db = getDb();
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

      const [userStats] = await db
        .select({
          traders: sql<number>`count(*) filter (where ${users.role} = 'trader')`,
          recent: sql<number>`count(*) filter (where ${users.role} = 'trader' and ${users.createdAt} >= ${sevenDaysAgo.toISOString()})`,
        })
        .from(users);

      const [accountStats] = await db
        .select({
          funded: sql<number>`count(*) filter (where ${tradingAccounts.status} = 'funded')`,
          inEvaluation: sql<number>`count(*) filter (where ${tradingAccounts.status} in ('phase1','phase2'))`,
          allocated: sql<number>`coalesce(sum(${tradingAccounts.startingBalance}), 0)`,
        })
        .from(tradingAccounts);

      const [payoutStats] = await db
        .select({
          paid: sql<number>`coalesce(sum(${payouts.amount}) filter (where ${payouts.status} = 'paid'), 0)`,
          pending: sql<number>`coalesce(sum(${payouts.amount}) filter (where ${payouts.status} in ('requested','processing')), 0)`,
        })
        .from(payouts);

      const [ticketStats] = await db
        .select({
          open: sql<number>`count(*) filter (where ${supportTickets.status} != 'closed')`,
        })
        .from(supportTickets);

      const [kycStats] = await db
        .select({
          pending: sql<number>`count(*) filter (where ${kycVerifications.status} = 'pending')`,
        })
        .from(kycVerifications);

      const [leadStats] = await db
        .select({
          fresh: sql<number>`count(*) filter (where ${crmLeads.status} = 'new')`,
        })
        .from(crmLeads);

      return {
        totalTraders: Number(userStats?.traders ?? 0),
        signupsLast7Days: Number(userStats?.recent ?? 0),
        fundedAccounts: Number(accountStats?.funded ?? 0),
        accountsInEvaluation: Number(accountStats?.inEvaluation ?? 0),
        capitalAllocated: Number(accountStats?.allocated ?? 0),
        payoutsPaid: Number(payoutStats?.paid ?? 0),
        payoutsPending: Number(payoutStats?.pending ?? 0),
        openTickets: Number(ticketStats?.open ?? 0),
        kycPending: Number(kycStats?.pending ?? 0),
        newLeads: Number(leadStats?.fresh ?? 0),
      } satisfies AdminKpis;
    },
    null,
  );
}

/**
 * The live registrations feed. Each signup is matched back to the CRM lead it
 * created so the desk can see which tier the trader picked at signup.
 */
export async function getRecentSignups(limit = 12): Promise<SignupRow[]> {
  return safely(
    "getRecentSignups",
    async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.role, "trader"))
        .orderBy(desc(users.createdAt))
        .limit(limit);

      if (!rows.length) return [];

      const leads = await db
        .select()
        .from(crmLeads)
        .where(
          inArray(
            crmLeads.email,
            rows.map((r) => r.email),
          ),
        )
        .orderBy(desc(crmLeads.createdAt));

      return rows.map((user) => {
        const lead = leads.find((l) => l.email === user.email);
        return {
          user,
          interestedTier: lead?.interestedTier ?? null,
          leadSource: lead?.source ?? null,
        };
      });
    },
    [],
  );
}

export async function getLeads(limit = 40): Promise<LeadRow[]> {
  return safely(
    "getLeads",
    () =>
      getDb()
        .select()
        .from(crmLeads)
        .orderBy(desc(crmLeads.createdAt))
        .limit(limit),
    [],
  );
}

export async function getKycQueue(): Promise<KycRow[]> {
  return safely(
    "getKycQueue",
    async () => {
      const rows = await getDb()
        .select({ kyc: kycVerifications, user: users })
        .from(kycVerifications)
        .innerJoin(users, eq(kycVerifications.userId, users.id))
        .orderBy(desc(kycVerifications.submittedAt));
      return rows;
    },
    [],
  );
}

export async function getSupportQueue(): Promise<TicketRow[]> {
  return safely(
    "getSupportQueue",
    async () => {
      const db = getDb();
      const rows = await db
        .select({ ticket: supportTickets, user: users })
        .from(supportTickets)
        .innerJoin(users, eq(supportTickets.userId, users.id))
        .where(ne(supportTickets.status, "closed"))
        .orderBy(desc(supportTickets.updatedAt))
        .limit(30);

      if (!rows.length) return [];

      const counts = await db
        .select({
          ticketId: ticketMessages.ticketId,
          total: sql<number>`count(*)`,
        })
        .from(ticketMessages)
        .where(
          inArray(
            ticketMessages.ticketId,
            rows.map((r) => r.ticket.id),
          ),
        )
        .groupBy(ticketMessages.ticketId);

      return rows.map((row) => ({
        ...row,
        messageCount: Number(
          counts.find((c) => c.ticketId === row.ticket.id)?.total ?? 0,
        ),
      }));
    },
    [],
  );
}

export async function getPayoutQueue(limit = 30): Promise<PayoutRow[]> {
  return safely(
    "getPayoutQueue",
    () =>
      getDb()
        .select({
          payout: payouts,
          account: tradingAccounts,
          user: users,
          tierName: accountTiers.name,
        })
        .from(payouts)
        .innerJoin(
          tradingAccounts,
          eq(payouts.tradingAccountId, tradingAccounts.id),
        )
        .innerJoin(users, eq(tradingAccounts.userId, users.id))
        .innerJoin(accountTiers, eq(tradingAccounts.tierId, accountTiers.id))
        .orderBy(desc(payouts.requestedAt))
        .limit(limit),
    [],
  );
}
