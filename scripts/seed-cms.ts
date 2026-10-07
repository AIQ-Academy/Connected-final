/**
 * Populate `cms_documents` from the shipped defaults.
 *
 * Existing documents are left alone — editors' work is never overwritten. Pass
 * `--force` to reset a key back to the code defaults, which is the quickest
 * way to recover from a document that has drifted out of schema.
 *
 *   npm run db:seed:cms
 *   npm run db:seed:cms -- --force home
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { eq } from "drizzle-orm";

import { getDb } from "../src/db";
import { cmsDocuments } from "../src/db/schema";
import { cmsDefaults } from "../src/lib/cms/defaults";
import { CMS_KEYS, type CmsKey } from "../src/lib/cms/schemas";

const args = process.argv.slice(2);
const force = args.includes("--force");
const requested = args.filter((arg) => !arg.startsWith("--")) as CmsKey[];

const targets: CmsKey[] = requested.length
  ? requested.filter((key): key is CmsKey =>
      (CMS_KEYS as readonly string[]).includes(key),
    )
  : [...CMS_KEYS];

if (requested.length && targets.length !== requested.length) {
  const unknown = requested.filter((key) => !targets.includes(key));
  throw new Error(
    `Unknown CMS key(s): ${unknown.join(", ")}. Known keys: ${CMS_KEYS.join(", ")}`,
  );
}

async function main() {
  const db = getDb();
  console.log(`Seeding CMS documents${force ? " (force)" : ""}…`);

  for (const key of targets) {
    const payload = cmsDefaults[key];

    const [existing] = await db
      .select({ id: cmsDocuments.id })
      .from(cmsDocuments)
      .where(eq(cmsDocuments.key, key))
      .limit(1);

    if (!existing) {
      await db.insert(cmsDocuments).values({ key, payload });
      console.log(`  ${key}: created`);
      continue;
    }

    if (!force) {
      console.log(`  ${key}: already present, left untouched`);
      continue;
    }

    await db
      .update(cmsDocuments)
      .set({ payload, updatedAt: new Date() })
      .where(eq(cmsDocuments.key, key));
    console.log(`  ${key}: reset to defaults`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
