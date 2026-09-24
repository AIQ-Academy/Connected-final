import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, hasDatabase } from "@/db";
import {
  accountTiers,
  crmLeads,
  kycVerifications,
  users,
} from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation";
import { registrationSchema } from "@/lib/validation/registration";

export const runtime = "nodejs";

/** Postgres unique-violation, raised if two signups race on the same email. */
const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`register:${ip}`, { limit: 5, windowMs: 10 * 60_000 });

  if (!limit.ok) {
    return NextResponse.json(
      {
        message:
          "Too many signup attempts from this connection. Try again in a few minutes.",
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

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Some details need another look.",
        errors: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      {
        message:
          "Registration is temporarily offline. Email support@connectfunded.com and we will open your account manually.",
      },
      { status: 503 },
    );
  }

  const input = parsed.data;
  const db = getDb();

  try {
    const [tier] = await db
      .select()
      .from(accountTiers)
      .where(eq(accountTiers.code, input.tierCode))
      .limit(1);

    if (!tier) {
      return NextResponse.json(
        {
          message: "That account is no longer available.",
          errors: { tierCode: "Choose one of the current account sizes." },
        },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          message: "That email already has a Connect Funded account.",
          errors: {
            email: "This email is already registered. Sign in instead, or reset your password.",
          },
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(input.password);

    const [user] = await db
      .insert(users)
      .values({
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        phone: input.phone,
        country: input.country,
        experience: input.experience,
        role: "trader",
      })
      .returning();

    // Sales needs the lead the moment the trader lands, not after payment.
    await db.insert(crmLeads).values({
      fullName: user.fullName,
      email: user.email,
      phone: input.phone,
      country: input.country,
      source: "registration",
      interestedTier: tier.code,
      status: "new",
      notes: `Selected the ${tier.name} ${Number(tier.accountSize).toLocaleString("en-US")} account at signup. Marketing opt-in: ${input.marketingOptIn ? "yes" : "no"}.`,
    });

    // Give the trader a KYC record straight away so the portal can show a
    // real "not started" state rather than an absence.
    await db
      .insert(kycVerifications)
      .values({ userId: user.id, status: "not_started" })
      .onConflictDoNothing();

    await recordAudit({
      actorId: user.id,
      action: "user.registered",
      entityType: "user",
      entityId: user.id,
      metadata: {
        tier: tier.code,
        country: input.country,
        experience: input.experience,
        marketingOptIn: input.marketingOptIn,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        reference: user.id.slice(0, 8).toUpperCase(),
        message: "Account created.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === UNIQUE_VIOLATION
    ) {
      return NextResponse.json(
        {
          message: "That email already has a Connect Funded account.",
          errors: {
            email: "This email is already registered. Sign in instead, or reset your password.",
          },
        },
        { status: 409 },
      );
    }

    console.error("[api/register] failed", error);
    return NextResponse.json(
      {
        message:
          "Something went wrong on our side. Try again, or email support@connectfunded.com.",
      },
      { status: 500 },
    );
  }
}
