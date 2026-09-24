import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run `vercel env pull .env.local` to fetch it.",
    );
  }
  return drizzle(neon(url), { schema });
}

// Lazily constructed so `next build` does not crash in environments where the
// database has not been provisioned yet. Deliberately not a Proxy — those
// break libraries that introspect the client object.
let cached: Database | null = null;

export function getDb(): Database {
  if (!cached) cached = createDb();
  return cached;
}

/** True when the app has a database to talk to. */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
