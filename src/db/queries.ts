import "server-only";

import { and, asc, desc, eq, gte, sql } from "drizzle-orm";

import { getDb, hasDatabase } from "@/db";
import {
  accountTiers,
  cmsDocuments,
  crmLeads,
  economicCalendarEvents,
  faqs,
  marketInstruments,
  mediaAssets,
  newsArticles,
  payouts,
  siteSettings,
  supportTickets,
  testimonials,
  ticketMessages,
  tradingAccounts,
  users,
  type AccountTier,
  type EconomicEvent,
  type Faq,
  type MarketInstrument,
  type NewsArticle,
  type Testimonial,
} from "@/db/schema";
import {
  faqSeed,
  instrumentSeed,
  newsSeed,
  testimonialSeed,
  tierSeed,
} from "@/db/seed-data";

/**
 * Every read falls back to the seed constants when the database is
 * unreachable, so a misconfigured environment degrades to static content
 * instead of a 500. The client should never see a broken page.
 */
async function withFallback<T>(
  query: () => Promise<T>,
  fallback: () => T,
  label: string,
): Promise<T> {
  if (!hasDatabase()) return fallback();
  try {
    const result = await query();
    if (Array.isArray(result) && result.length === 0) return fallback();
    return result;
  } catch (error) {
    console.error(`[db] ${label} failed, serving fallback content`, error);
    return fallback();
  }
}

export async function getAccountTiers(): Promise<AccountTier[]> {
  return withFallback(
    () => getDb().select().from(accountTiers).orderBy(asc(accountTiers.sortOrder)),
    () =>
      tierSeed.map((t, i) => ({
        ...t,
        id: `seed-tier-${i}`,
        createdAt: new Date(),
      })) as unknown as AccountTier[],
    "getAccountTiers",
  );
}

export async function getInstruments(): Promise<MarketInstrument[]> {
  return withFallback(
    () =>
      getDb()
        .select()
        .from(marketInstruments)
        .where(eq(marketInstruments.isActive, true))
        .orderBy(asc(marketInstruments.sortOrder)),
    () =>
      instrumentSeed.map((t, i) => ({
        ...t,
        id: `seed-instrument-${i}`,
        isActive: true,
      })) as unknown as MarketInstrument[],
    "getInstruments",
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return withFallback(
    () =>
      getDb()
        .select()
        .from(testimonials)
        .where(eq(testimonials.isPublished, true))
        .orderBy(asc(testimonials.sortOrder)),
    () =>
      testimonialSeed.map((t, i) => ({
        ...t,
        id: `seed-testimonial-${i}`,
        isPublished: true,
        createdAt: new Date(),
      })) as unknown as Testimonial[],
    "getTestimonials",
  );
}

export async function getFaqs(): Promise<Faq[]> {
  return withFallback(
    () => getDb().select().from(faqs).orderBy(asc(faqs.sortOrder)),
    () =>
      faqSeed.map((f, i) => ({
        ...f,
        id: `seed-faq-${i}`,
      })) as unknown as Faq[],
    "getFaqs",
  );
}

export async function getSiteSettings(): Promise<{
  fundedEnabled: boolean;
  brokerEnabled: boolean;
}> {
  const fallback = [{ fundedEnabled: true, brokerEnabled: true }] as const;

  const rows = await withFallback(
    () =>
      getDb()
        .select({
          fundedEnabled: siteSettings.fundedEnabled,
          brokerEnabled: siteSettings.brokerEnabled,
        })
        .from(siteSettings)
        .limit(1),
    () => [...fallback],
    "getSiteSettings",
  );

  return rows[0] ?? fallback[0];
}

export async function getNews(limit = 6): Promise<NewsArticle[]> {
  return withFallback(
    () =>
      getDb()
        .select()
        .from(newsArticles)
        .orderBy(desc(newsArticles.publishedAt))
        .limit(limit),
    () =>
      newsSeed.slice(0, limit).map(({ daysAgo, ...a }, i) => ({
        ...a,
        id: `seed-news-${i}`,
        body: null,
        publishedAt: new Date(Date.now() - daysAgo * 86_400_000),
        createdAt: new Date(),
      })) as unknown as NewsArticle[],
    "getNews",
  );
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  return withFallback(
    () =>
      getDb()
        .select()
        .from(newsArticles)
        .where(eq(newsArticles.slug, slug))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    () => {
      const found = newsSeed.find((article) => article.slug === slug);
      if (!found) return null;
      const { daysAgo, ...article } = found;
      return {
        ...article,
        id: `seed-news-${slug}`,
        body: null,
        publishedAt: new Date(Date.now() - daysAgo * 86_400_000),
        createdAt: new Date(),
      } as unknown as NewsArticle;
    },
    "getNewsBySlug",
  );
}

export async function getUpcomingEvents(limit = 12): Promise<EconomicEvent[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  return withFallback(
    () =>
      getDb()
        .select()
        .from(economicCalendarEvents)
        .where(gte(economicCalendarEvents.eventTime, since))
        .orderBy(asc(economicCalendarEvents.eventTime))
        .limit(limit),
    () => [],
    "getUpcomingEvents",
  );
}

/* -------------------------------------------------------------------------
 * CMS documents + media slots
 * ---------------------------------------------------------------------- */

/**
 * Raw payload for a CMS document, or `null` when there is no row, no database
 * or the read failed. Callers are expected to validate and merge it over their
 * defaults — see `src/lib/cms/get-content.ts`.
 */
export async function getCmsDocument(key: string): Promise<unknown | null> {
  return withFallback(
    () =>
      getDb()
        .select({ payload: cmsDocuments.payload })
        .from(cmsDocuments)
        .where(eq(cmsDocuments.key, key))
        .limit(1)
        .then((rows) => rows[0]?.payload ?? null),
    () => null,
    `getCmsDocument(${key})`,
  );
}

/** `key -> updated_at` for every stored document, for sitemap freshness. */
export async function getCmsDocumentTimestamps(): Promise<Map<string, Date>> {
  const rows = await withFallback(
    () =>
      getDb()
        .select({ key: cmsDocuments.key, updatedAt: cmsDocuments.updatedAt })
        .from(cmsDocuments),
    () => [] as { key: string; updatedAt: Date }[],
    "getCmsDocumentTimestamps",
  );

  return new Map(rows.map((row) => [row.key, row.updatedAt]));
}

export type MediaSlotRecord = {
  slot: string;
  blobUrl: string;
  width: number;
  height: number;
  alt: string;
  blurDataUrl: string | null;
};

const mediaColumns = {
  slot: mediaAssets.slot,
  blobUrl: mediaAssets.blobUrl,
  width: mediaAssets.width,
  height: mediaAssets.height,
  alt: mediaAssets.alt,
  blurDataUrl: mediaAssets.blurDataUrl,
};

/**
 * Every uploaded slot, keyed by slot name. An empty map is a valid result —
 * it just means nothing has been replaced yet and the code-level Unsplash
 * defaults still apply.
 */
export async function getMediaSlots(): Promise<Map<string, MediaSlotRecord>> {
  const rows = await withFallback(
    () => getDb().select(mediaColumns).from(mediaAssets),
    () => [] as MediaSlotRecord[],
    "getMediaSlots",
  );

  return new Map(rows.map((row) => [row.slot, row]));
}

export async function getMediaSlot(
  slot: string,
): Promise<MediaSlotRecord | null> {
  return withFallback(
    () =>
      getDb()
        .select(mediaColumns)
        .from(mediaAssets)
        .where(eq(mediaAssets.slot, slot))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    () => null,
    `getMediaSlot(${slot})`,
  );
}

/* -------------------------------------------------------------------------
 * Portal + admin reads
 * ---------------------------------------------------------------------- */

export async function getDemoTrader() {
  if (!hasDatabase()) return null;
  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@connectfunded.com"))
      .limit(1);
    if (!user) return null;

    const accounts = await db
      .select({
        account: tradingAccounts,
        tier: accountTiers,
      })
      .from(tradingAccounts)
      .innerJoin(accountTiers, eq(tradingAccounts.tierId, accountTiers.id))
      .where(eq(tradingAccounts.userId, user.id))
      .orderBy(desc(tradingAccounts.createdAt));

    const accountIds = accounts.map((a) => a.account.id);
    const payoutRows = accountIds.length
      ? await db
          .select()
          .from(payouts)
          .where(
            sql`${payouts.tradingAccountId} in ${accountIds}`,
          )
          .orderBy(desc(payouts.requestedAt))
      : [];

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, user.id))
      .orderBy(desc(supportTickets.updatedAt));

    const messages = tickets.length
      ? await db
          .select()
          .from(ticketMessages)
          .where(eq(ticketMessages.ticketId, tickets[0].id))
          .orderBy(asc(ticketMessages.createdAt))
      : [];

    return { user, accounts, payouts: payoutRows, tickets, messages };
  } catch (error) {
    console.error("[db] getDemoTrader failed", error);
    return null;
  }
}

export async function getAdminOverview() {
  if (!hasDatabase()) return null;
  try {
    const db = getDb();

    const [counts] = await db
      .select({
        traders: sql<number>`count(*) filter (where ${users.role} = 'trader')`,
        total: sql<number>`count(*)`,
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

    const leads = await db
      .select()
      .from(crmLeads)
      .orderBy(desc(crmLeads.createdAt))
      .limit(12);

    const recentSignups = await db
      .select()
      .from(users)
      .where(eq(users.role, "trader"))
      .orderBy(desc(users.createdAt))
      .limit(10);

    const openTickets = await db
      .select({ ticket: supportTickets, user: users })
      .from(supportTickets)
      .innerJoin(users, eq(supportTickets.userId, users.id))
      .where(
        and(
          sql`${supportTickets.status} != 'closed'`,
        ),
      )
      .orderBy(desc(supportTickets.updatedAt))
      .limit(8);

    return {
      counts,
      accountStats,
      payoutStats,
      leads,
      recentSignups,
      openTickets,
    };
  } catch (error) {
    console.error("[db] getAdminOverview failed", error);
    return null;
  }
}
