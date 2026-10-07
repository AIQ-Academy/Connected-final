import { NextResponse } from "next/server";

import { recordAudit } from "@/lib/audit";
import { destroySession, getSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Posted from the app shell as a plain form, so it answers with a redirect. */
export async function POST(request: Request) {
  const session = await getSession();
  await destroySession();

  if (session) {
    await recordAudit({
      actorId: session.userId,
      action: "auth.signed_out",
      entityType: "user",
      entityId: session.userId,
    });
  }

  return NextResponse.redirect(new URL("/portal/login", request.url), 303);
}
