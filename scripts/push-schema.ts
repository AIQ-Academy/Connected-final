/**
 * Apply schema deltas via Neon HTTP.
 *
 * `drizzle-kit push` uses WebSockets and often hangs locally against Neon.
 * The app already talks to Neon over HTTP — use the same transport here.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(url);

const statements = [
  `DO $$ BEGIN
     CREATE TYPE "public"."audience" AS ENUM('funded', 'broker', 'both');
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$`,
  `CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "funded_enabled" boolean DEFAULT true NOT NULL,
    "broker_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "cms_documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key" text NOT NULL,
    "payload" jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "cms_documents_key_unique" UNIQUE("key")
  )`,
  `CREATE TABLE IF NOT EXISTS "media_assets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slot" text NOT NULL,
    "blob_url" text NOT NULL,
    "width" smallint NOT NULL,
    "height" smallint NOT NULL,
    "alt" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "media_assets_slot_unique" UNIQUE("slot")
  )`,
  `CREATE TABLE IF NOT EXISTS "broker_account_tiers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "min_deposit" numeric NOT NULL,
    "spread_from" text NOT NULL,
    "leverage" text NOT NULL,
    "commission" text NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL,
    "highlights" jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "broker_account_tiers_code_unique" UNIQUE("code")
  )`,
  `ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "blur_data_url" text`,
  `ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "variants" jsonb`,
  // The live-trading product moved from /broker to /trading. Rename the CMS
  // document to match the route, but only when it would not collide with a
  // document someone already saved under the new key.
  `UPDATE "cms_documents" SET "key" = 'trading', "updated_at" = now()
   WHERE "key" = 'broker'
     AND NOT EXISTS (SELECT 1 FROM "cms_documents" WHERE "key" = 'trading')`,
  `ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "audience" "audience" DEFAULT 'both' NOT NULL`,
  `ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "audience" "audience" DEFAULT 'both' NOT NULL`,
  `ALTER TABLE "market_instruments" ALTER COLUMN "pip_size" SET DEFAULT 0.0001`,
  `ALTER TABLE "market_instruments" ALTER COLUMN "base_spread" SET DEFAULT 0`,
  `ALTER TABLE "trading_accounts" ALTER COLUMN "current_drawdown_pct" SET DEFAULT 0`,
  `INSERT INTO "site_settings" ("funded_enabled", "broker_enabled")
   SELECT true, true
   WHERE NOT EXISTS (SELECT 1 FROM "site_settings" LIMIT 1)`,
];

async function main() {
  console.log("Applying schema via Neon HTTP…");
  for (const statement of statements) {
    const preview = statement.replace(/\s+/g, " ").trim().slice(0, 80);
    process.stdout.write(`  ${preview}… `);
    await sql.query(statement);
    console.log("ok");
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
