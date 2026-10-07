import { NextResponse } from "next/server";

import { findUserByEmail } from "@/db/portal-queries";
import { recordAudit } from "@/lib/audit";
import { createSession, type SessionRole } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation";
import { loginSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

/**
 * Replaced wholesale when Clerk lands — the client only depends on the JSON
 * contract `{ ok, redirectTo } | { message, errors }`.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, { limit: 10, windowMs: 10 * 60_000 });

  if (!limit.ok) {
    return NextResponse.json(
      { message: "Too many sign-in attempts. Try again in a few minutes." },
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Check your details.", errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { email, password, next } = parsed.data;
  const user = await findUserByEmail(email);

  // One message for both branches so the form cannot be used to enumerate
  // which email addresses exist.
  const invalid = NextResponse.json(
    { message: "That email and password combination does not match an account." },
    { status: 401 },
  );

  if (!user) {
    // Burn comparable time so a missing account is not detectably faster.
    await verifyPassword(password, null);
    return invalid;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid;

  await createSession({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as SessionRole,
  });

  await recordAudit({
    actorId: user.id,
    action: "auth.signed_in",
    entityType: "user",
    entityId: user.id,
    metadata: { role: user.role },
  });

  const fallback = user.role === "admin" ? "/admin" : "/portal";

  return NextResponse.json({ ok: true, redirectTo: next || fallback });
}
