import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export const runtime = "nodejs";

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!hasDatabase()) {
    // Without a database the subscription cannot be persisted, but the
    // marketing surface should still behave correctly in preview builds.
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    await getDb()
      .insert(newsletterSubscribers)
      .values({ email: parsed.data.email })
      // Re-subscribing is idempotent rather than an error the visitor sees.
      .onConflictDoNothing({ target: newsletterSubscribers.email });
  } catch (error) {
    console.error("[api/newsletter] insert failed", error);
    return NextResponse.json(
      { error: "Could not save that subscription." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
