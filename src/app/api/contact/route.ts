import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, hasDatabase } from "@/db";
import { contactSubmissions, crmLeads } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation";
import { contactSchema } from "@/lib/validation/contact";

export const runtime = "nodejs";

/** Sales and partnerships enquiries are worth a CRM lead; support is not. */
const LEAD_TOPICS = new Set(["sales", "partnerships"]);

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60_000 });

  if (!limit.ok) {
    return NextResponse.json(
      {
        message:
          "You have sent several messages already. Give us a few minutes to reply to those first.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "We could not read that request." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Some details need another look.",
        errors: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Honeypot: silently accept so the bot does not learn anything.
  if (input.company) {
    return NextResponse.json({ ok: true, message: "Message received." });
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      {
        message:
          "Our contact desk is temporarily offline. Email support@connectfunded.com and we will pick it up straight away.",
      },
      { status: 503 },
    );
  }

  try {
    const db = getDb();

    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        fullName: input.fullName,
        email: input.email,
        topic: input.topic,
        message: input.message,
        status: "new",
      })
      .returning();

    // Do not create a duplicate lead if this person already wrote in today.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentLead] = await db
      .select({ id: crmLeads.id })
      .from(crmLeads)
      .where(
        and(eq(crmLeads.email, input.email), gte(crmLeads.createdAt, since)),
      )
      .orderBy(desc(crmLeads.createdAt))
      .limit(1);

    if (!recentLead) {
      await db.insert(crmLeads).values({
        fullName: input.fullName,
        email: input.email,
        source: "contact_form",
        status: "new",
        notes: `${topicLabel(input.topic)} enquiry: ${input.message.slice(0, 400)}`,
      });
    }

    await recordAudit({
      action: "contact.submitted",
      entityType: "contact_submission",
      entityId: submission.id,
      metadata: { topic: input.topic, leadCreated: !recentLead },
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Message received. Our team replies within one business hour during market sessions.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/contact] failed", error);
    return NextResponse.json(
      {
        message:
          "We could not send that just now. Try again, or email support@connectfunded.com.",
      },
      { status: 500 },
    );
  }
}

function topicLabel(topic: string) {
  return (
    {
      support: "Support",
      sales: "Funding and pricing",
      partnerships: "Partnership",
      careers: "Careers",
      general: "General",
    }[topic] ?? "General"
  );
}
