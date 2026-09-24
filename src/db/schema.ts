import { relations } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------
 * Enums — ported from the original database/schema.sql
 * ---------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", [
  "trader",
  "admin",
  "support_agent",
  "sales_agent",
]);

export const kycStatus = pgEnum("kyc_status", [
  "not_started",
  "pending",
  "verified",
  "rejected",
]);

export const accountStatus = pgEnum("account_status", [
  "phase1",
  "phase2",
  "funded",
  "failed",
  "payout_hold",
]);

export const tradingPlatform = pgEnum("trading_platform", [
  "mt5",
  "ctrader",
  "web_terminal",
]);

export const payoutStatus = pgEnum("payout_status", [
  "requested",
  "processing",
  "paid",
  "rejected",
]);

export const ticketStatus = pgEnum("ticket_status", [
  "open",
  "pending",
  "closed",
]);

export const ticketPriority = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
]);

export const ticketSender = pgEnum("ticket_sender", ["user", "agent"]);

export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]);

export const contactTopic = pgEnum("contact_topic", [
  "support",
  "sales",
  "partnerships",
  "careers",
  "general",
]);

export const contactStatus = pgEnum("contact_status", [
  "new",
  "in_progress",
  "resolved",
]);

export const impactLevel = pgEnum("impact_level", ["low", "medium", "high"]);

export const audience = pgEnum("audience", ["funded", "broker", "both"]);

export const assetClass = pgEnum("asset_class", [
  "forex",
  "metals",
  "commodities",
  "indices",
  "crypto",
  "stocks",
]);

export const experienceLevel = pgEnum("experience_level", [
  "none",
  "under_1y",
  "1_3y",
  "3_5y",
  "over_5y",
]);

/* -------------------------------------------------------------------------
 * Users & auth
 * ---------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    // Stored lowercased by the application so this unique index is
    // effectively case-insensitive without needing the citext extension.
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    /** Clerk user id, once the trader claims a portal login. */
    externalAuthId: text("external_auth_id"),
    phone: text("phone"),
    country: text("country"),
    experience: experienceLevel("experience"),
    role: userRole("role").notNull().default("trader"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    index("idx_users_role").on(t.role),
    index("idx_users_created").on(t.createdAt),
  ],
);

/* -------------------------------------------------------------------------
 * KYC
 * ---------------------------------------------------------------------- */

export const kycVerifications = pgTable(
  "kyc_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: kycStatus("status").notNull().default("not_started"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by"),
    rejectionReason: text("rejection_reason"),
  },
  (t) => [
    uniqueIndex("kyc_user_key").on(t.userId),
    index("idx_kyc_status").on(t.status),
  ],
);

/* -------------------------------------------------------------------------
 * Site settings — product on/off toggles
 * ---------------------------------------------------------------------- */

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundedEnabled: boolean("funded_enabled").notNull().default(true),
  brokerEnabled: boolean("broker_enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------
 * CMS documents + media assets (managed by admin)
 * ---------------------------------------------------------------------- */

export const cmsDocuments = pgTable("cms_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  slot: text("slot").notNull().unique(),
  blobUrl: text("blob_url").notNull(),
  width: smallint("width").notNull(),
  height: smallint("height").notNull(),
  alt: text("alt").notNull(),
  /** Inline base64 WebP used as the `next/image` blur placeholder. */
  blurDataUrl: text("blur_data_url"),
  /** Reserved for future derivative renditions keyed by name. */
  variants: jsonb("variants"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const brokerAccountTiersDb = pgTable("broker_account_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  minDeposit: numeric("min_deposit", { mode: "number" }).notNull(),
  spreadFrom: text("spread_from").notNull(),
  leverage: text("leverage").notNull(),
  commission: text("commission").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: smallint("sort_order").notNull().default(0),
  highlights: jsonb("highlights").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------
 * Account tiers — the funding product catalog
 * ---------------------------------------------------------------------- */

export const accountTiers = pgTable("account_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  accountSize: numeric("account_size", { mode: "number" }).notNull(),
  price: numeric("price", { mode: "number" }).notNull(),
  phase1TargetPct: numeric("phase1_target_pct", { mode: "number" }).notNull(),
  phase2TargetPct: numeric("phase2_target_pct", { mode: "number" }).notNull(),
  maxDailyDrawdownPct: numeric("max_daily_drawdown_pct", {
    mode: "number",
  }).notNull(),
  maxOverallDrawdownPct: numeric("max_overall_drawdown_pct", {
    mode: "number",
  }).notNull(),
  minTradingDays: smallint("min_trading_days").notNull(),
  profitSplitPct: smallint("profit_split_pct").notNull(),
  payoutFrequency: text("payout_frequency").notNull().default("bi-weekly"),
  maxLeverage: text("max_leverage").notNull().default("1:100"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: smallint("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------
 * Trading accounts
 * ---------------------------------------------------------------------- */

export const tradingAccounts = pgTable(
  "trading_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tierId: uuid("tier_id")
      .notNull()
      .references(() => accountTiers.id),
    login: text("login").notNull(),
    status: accountStatus("status").notNull().default("phase1"),
    platform: tradingPlatform("platform").notNull().default("mt5"),
    startingBalance: numeric("starting_balance", { mode: "number" }).notNull(),
    currentBalance: numeric("current_balance", { mode: "number" }).notNull(),
    equity: numeric("equity", { mode: "number" }).notNull(),
    currentDrawdownPct: numeric("current_drawdown_pct", { mode: "number" })
      .notNull()
      .default(0),
    tradingDays: smallint("trading_days").notNull().default(0),
    phase1StartedAt: timestamp("phase1_started_at", { withTimezone: true }),
    phase1PassedAt: timestamp("phase1_passed_at", { withTimezone: true }),
    phase2StartedAt: timestamp("phase2_started_at", { withTimezone: true }),
    phase2PassedAt: timestamp("phase2_passed_at", { withTimezone: true }),
    fundedAt: timestamp("funded_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_trading_accounts_user").on(t.userId),
    index("idx_trading_accounts_status").on(t.status),
  ],
);

/* -------------------------------------------------------------------------
 * Payouts
 * ---------------------------------------------------------------------- */

export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tradingAccountId: uuid("trading_account_id")
      .notNull()
      .references(() => tradingAccounts.id, { onDelete: "cascade" }),
    amount: numeric("amount", { mode: "number" }).notNull(),
    status: payoutStatus("status").notNull().default("requested"),
    method: text("method"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (t) => [
    index("idx_payouts_account").on(t.tradingAccountId),
    index("idx_payouts_status").on(t.status),
  ],
);

/* -------------------------------------------------------------------------
 * Support
 * ---------------------------------------------------------------------- */

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    subject: text("subject").notNull(),
    status: ticketStatus("status").notNull().default("open"),
    priority: ticketPriority("priority").notNull().default("medium"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_tickets_status").on(t.status)],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => supportTickets.id, { onDelete: "cascade" }),
    senderType: ticketSender("sender_type").notNull(),
    senderId: uuid("sender_id"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_ticket_messages_ticket").on(t.ticketId)],
);

/* -------------------------------------------------------------------------
 * Contact + CRM
 * ---------------------------------------------------------------------- */

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    topic: contactTopic("topic").notNull().default("general"),
    message: text("message").notNull(),
    status: contactStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_contact_status").on(t.status)],
);

export const crmLeads = pgTable(
  "crm_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    country: text("country"),
    /** 'registration' | 'contact_form' | 'ai_chatbot' | 'newsletter' */
    source: text("source"),
    interestedTier: text("interested_tier"),
    status: leadStatus("status").notNull().default("new"),
    assignedTo: uuid("assigned_to"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_leads_status").on(t.status),
    index("idx_leads_created").on(t.createdAt),
  ],
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------
 * Market reference data
 * ---------------------------------------------------------------------- */

export const marketInstruments = pgTable("market_instruments", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbol: text("symbol").notNull().unique(),
  displayName: text("display_name").notNull(),
  /** TradingView-compatible symbol, e.g. "OANDA:XAUUSD". */
  tvSymbol: text("tv_symbol").notNull(),
  assetClass: assetClass("asset_class").notNull(),
  pipSize: numeric("pip_size", { mode: "number" }).notNull().default(0.0001),
  baseSpread: numeric("base_spread", { mode: "number" }).notNull().default(0),
  maxLeverage: text("max_leverage").notNull().default("1:100"),
  tradingHours: text("trading_hours").notNull().default("24/5"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const economicCalendarEvents = pgTable(
  "economic_calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventTime: timestamp("event_time", { withTimezone: true }).notNull(),
    currency: text("currency").notNull(),
    title: text("title").notNull(),
    impact: impactLevel("impact").notNull(),
    forecast: text("forecast"),
    previous: text("previous"),
    actual: text("actual"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_calendar_time").on(t.eventTime),
    index("idx_calendar_impact").on(t.impact),
  ],
);

export const newsArticles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body"),
    author: text("author"),
    readMinutes: smallint("read_minutes").notNull().default(4),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_news_published").on(t.publishedAt)],
);

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title").notNull(),
  country: text("country"),
  quote: text("quote").notNull(),
  rating: smallint("rating").notNull().default(5),
  accountSize: numeric("account_size", { mode: "number" }),
  payoutAmount: numeric("payout_amount", { mode: "number" }),
  audience: audience("audience").notNull().default("both"),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: smallint("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  audience: audience("audience").notNull().default("both"),
  sortOrder: smallint("sort_order").notNull().default(0),
});

/* -------------------------------------------------------------------------
 * Admin accountability
 * ---------------------------------------------------------------------- */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorId: uuid("actor_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_audit_entity").on(t.entityType, t.entityId)],
);

/* -------------------------------------------------------------------------
 * Relations
 * ---------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ many, one }) => ({
  tradingAccounts: many(tradingAccounts),
  tickets: many(supportTickets),
  kyc: one(kycVerifications, {
    fields: [users.id],
    references: [kycVerifications.userId],
  }),
}));

export const tradingAccountsRelations = relations(
  tradingAccounts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [tradingAccounts.userId],
      references: [users.id],
    }),
    tier: one(accountTiers, {
      fields: [tradingAccounts.tierId],
      references: [accountTiers.id],
    }),
    payouts: many(payouts),
  }),
);

export const payoutsRelations = relations(payouts, ({ one }) => ({
  account: one(tradingAccounts, {
    fields: [payouts.tradingAccountId],
    references: [tradingAccounts.id],
  }),
}));

export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    user: one(users, {
      fields: [supportTickets.userId],
      references: [users.id],
    }),
    messages: many(ticketMessages),
  }),
);

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketMessages.ticketId],
    references: [supportTickets.id],
  }),
}));

export const kycVerificationsRelations = relations(
  kycVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [kycVerifications.userId],
      references: [users.id],
    }),
  }),
);

export type AccountTier = typeof accountTiers.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type MarketInstrument = typeof marketInstruments.$inferSelect;
export type CmsDocument = typeof cmsDocuments.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type BrokerAccountTier = typeof brokerAccountTiersDb.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type CrmLead = typeof crmLeads.$inferSelect;
export type EconomicEvent = typeof economicCalendarEvents.$inferSelect;
export type User = typeof users.$inferSelect;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
