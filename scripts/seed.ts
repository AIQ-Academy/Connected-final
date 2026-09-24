import { config } from "dotenv";

config({ path: ".env.local" });

import { getDb } from "../src/db";
import {
  accountTiers,
  crmLeads,
  economicCalendarEvents,
  faqs,
  kycVerifications,
  marketInstruments,
  newsArticles,
  payouts,
  supportTickets,
  testimonials,
  ticketMessages,
  tradingAccounts,
  users,
} from "../src/db/schema";
import {
  calendarSeed,
  faqSeed,
  instrumentSeed,
  newsSeed,
  testimonialSeed,
  tierSeed,
} from "../src/db/seed-data";

const db = getDb();

function daysFromNow(days: number, hour = 12, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding Connect Funded…");

  // Order matters: children before parents so foreign keys stay satisfied.
  await db.delete(ticketMessages);
  await db.delete(supportTickets);
  await db.delete(payouts);
  await db.delete(tradingAccounts);
  await db.delete(kycVerifications);
  await db.delete(crmLeads);
  await db.delete(users);
  await db.delete(accountTiers);
  await db.delete(marketInstruments);
  await db.delete(economicCalendarEvents);
  await db.delete(newsArticles);
  await db.delete(testimonials);
  await db.delete(faqs);

  const tiers = await db
    .insert(accountTiers)
    .values(tierSeed.map((t) => ({ ...t })))
    .returning();
  console.log(`  ${tiers.length} account tiers`);

  await db.insert(marketInstruments).values(instrumentSeed);
  console.log(`  ${instrumentSeed.length} instruments`);

  await db.insert(testimonials).values(testimonialSeed);
  console.log(`  ${testimonialSeed.length} testimonials`);

  await db.insert(faqs).values(faqSeed);
  console.log(`  ${faqSeed.length} FAQ entries`);

  await db.insert(newsArticles).values(
    newsSeed.map(({ daysAgo, ...article }) => ({
      ...article,
      publishedAt: daysFromNow(-daysAgo, 9, 30),
    })),
  );
  console.log(`  ${newsSeed.length} articles`);

  await db.insert(economicCalendarEvents).values(
    calendarSeed.map((e) => ({
      eventTime: daysFromNow(e.dayOffset, e.hour, e.minute),
      currency: e.currency,
      title: e.title,
      impact: e.impact,
      forecast: e.forecast,
      previous: e.previous,
    })),
  );
  console.log(`  ${calendarSeed.length} calendar events`);

  // ---- A demo trader so the client portal has something real to render ----
  const growth = tiers.find((t) => t.code === "growth")!;
  const professional = tiers.find((t) => t.code === "professional")!;

  const [demoUser, adminUser] = await db
    .insert(users)
    .values([
      {
        fullName: "Marwan Haddad",
        email: "demo@connectfunded.com",
        phone: "+971 50 118 2200",
        country: "United Arab Emirates",
        experience: "3_5y" as const,
        role: "trader" as const,
        emailVerifiedAt: daysFromNow(-120),
        createdAt: daysFromNow(-124),
      },
      {
        fullName: "Operations Desk",
        email: "admin@connectfunded.com",
        country: "United Arab Emirates",
        role: "admin" as const,
        emailVerifiedAt: daysFromNow(-300),
        createdAt: daysFromNow(-300),
      },
    ])
    .returning();

  await db.insert(kycVerifications).values({
    userId: demoUser.id,
    status: "verified",
    submittedAt: daysFromNow(-118),
    reviewedAt: daysFromNow(-118, 15),
    reviewedBy: adminUser.id,
  });

  const [fundedAccount, evaluationAccount] = await db
    .insert(tradingAccounts)
    .values([
      {
        userId: demoUser.id,
        tierId: growth.id,
        login: "CF-504118",
        status: "funded" as const,
        platform: "mt5" as const,
        startingBalance: 50_000,
        currentBalance: 56_284.4,
        equity: 56_912.15,
        currentDrawdownPct: 1.8,
        tradingDays: 46,
        phase1StartedAt: daysFromNow(-120),
        phase1PassedAt: daysFromNow(-97),
        phase2StartedAt: daysFromNow(-96),
        phase2PassedAt: daysFromNow(-71),
        fundedAt: daysFromNow(-70),
        createdAt: daysFromNow(-120),
      },
      {
        userId: demoUser.id,
        tierId: professional.id,
        login: "CF-509427",
        status: "phase2" as const,
        platform: "ctrader" as const,
        startingBalance: 200_000,
        currentBalance: 213_640,
        equity: 213_118.5,
        currentDrawdownPct: 2.4,
        tradingDays: 9,
        phase1StartedAt: daysFromNow(-28),
        phase1PassedAt: daysFromNow(-9),
        phase2StartedAt: daysFromNow(-8),
        createdAt: daysFromNow(-28),
      },
    ])
    .returning();

  await db.insert(payouts).values([
    {
      tradingAccountId: fundedAccount.id,
      amount: 2_140.5,
      status: "paid",
      method: "USDT (TRC-20)",
      requestedAt: daysFromNow(-56),
      processedAt: daysFromNow(-55),
    },
    {
      tradingAccountId: fundedAccount.id,
      amount: 1_884.25,
      status: "paid",
      method: "Bank transfer",
      requestedAt: daysFromNow(-42),
      processedAt: daysFromNow(-40),
    },
    {
      tradingAccountId: fundedAccount.id,
      amount: 3_012.8,
      status: "paid",
      method: "USDT (TRC-20)",
      requestedAt: daysFromNow(-28),
      processedAt: daysFromNow(-27),
    },
    {
      tradingAccountId: fundedAccount.id,
      amount: 1_510.0,
      status: "paid",
      method: "USDT (TRC-20)",
      requestedAt: daysFromNow(-14),
      processedAt: daysFromNow(-13),
    },
    {
      tradingAccountId: fundedAccount.id,
      amount: 2_341.74,
      status: "processing",
      method: "USDT (TRC-20)",
      requestedAt: daysFromNow(-1),
    },
  ]);

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      userId: demoUser.id,
      reference: "CF-8841",
      subject: "Payout method change to bank transfer",
      status: "pending",
      priority: "medium",
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-1),
    })
    .returning();

  await db.insert(ticketMessages).values([
    {
      ticketId: ticket.id,
      senderType: "user",
      senderId: demoUser.id,
      message:
        "I would like my next payout sent by bank transfer instead of USDT. The account details are already on file from my KYC submission.",
      createdAt: daysFromNow(-2),
    },
    {
      ticketId: ticket.id,
      senderType: "agent",
      senderId: adminUser.id,
      message:
        "Happy to switch that over. I have flagged the pending payout so it does not process on the old method — you will get a confirmation email once the change is applied.",
      createdAt: daysFromNow(-1),
    },
  ]);

  await db.insert(crmLeads).values([
    {
      fullName: "Sofia Marchetti",
      email: "sofia.marchetti@example.com",
      phone: "+39 340 118 2244",
      country: "Italy",
      source: "registration",
      interestedTier: "growth",
      status: "new",
      createdAt: daysFromNow(0, 9, 12),
    },
    {
      fullName: "Tunde Adeyemi",
      email: "t.adeyemi@example.com",
      phone: "+234 803 552 1180",
      country: "Nigeria",
      source: "ai_chatbot",
      interestedTier: "starter",
      status: "contacted",
      notes:
        "Asked the assistant about weekend holding rules before signing up.",
      createdAt: daysFromNow(-1, 16, 40),
    },
    {
      fullName: "Hannah Weber",
      email: "hannah.weber@example.com",
      country: "Germany",
      source: "contact_form",
      interestedTier: "professional",
      status: "qualified",
      createdAt: daysFromNow(-2, 11, 5),
    },
    {
      fullName: "Rafael Castillo",
      email: "r.castillo@example.com",
      phone: "+52 55 4471 9902",
      country: "Mexico",
      source: "registration",
      interestedTier: "advanced",
      status: "converted",
      createdAt: daysFromNow(-4, 14, 22),
    },
    {
      fullName: "Yuki Tanaka",
      email: "yuki.tanaka@example.com",
      country: "Japan",
      source: "newsletter",
      status: "new",
      createdAt: daysFromNow(-5, 8, 3),
    },
  ]);

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
