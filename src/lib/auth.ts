import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Self-contained session auth.
 *
 * Clerk is the intended long-term provider. Everything Clerk would own is
 * behind this module's four functions — `createSession`, `getSession`,
 * `destroySession` and `requireRole` — plus the two route handlers under
 * `src/app/api/auth`. Swapping in Clerk means reimplementing those against
 * `auth()`/`currentUser()` and deleting the login route; no page, layout or
 * query in the portal or admin dashboard reads the cookie directly.
 */

export const SESSION_COOKIE = "cf_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionRole = "trader" | "admin" | "support_agent" | "sales_agent";

export type Session = {
  userId: string;
  email: string;
  fullName: string;
  role: SessionRole;
  /** Expiry as a unix timestamp in seconds. */
  exp: number;
};

function secret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;

  if (process.env.NODE_ENV === "production" && !configured) {
    console.warn(
      "[auth] SESSION_SECRET is not set. Sessions are signed with the " +
        "development key and will not survive a secret rotation.",
    );
  }
  return "connect-funded-development-session-key";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function serializeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSession(token: string | undefined): Session | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Session;
    if (!session.userId || !session.role) return null;
    if (session.exp * 1000 <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function createSession(
  user: Pick<Session, "userId" | "email" | "fullName" | "role">,
): Promise<Session> {
  const session: Session = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return session;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Guards a server component. Redirects to the login screen with a `next`
 * parameter when there is no session, and to the portal when the session
 * exists but lacks the required role.
 */
export async function requireRole(
  roles: SessionRole | SessionRole[],
  { redirectTo }: { redirectTo?: string } = {},
): Promise<Session> {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const session = await getSession();

  if (!session) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/portal/login${next}`);
  }

  if (!allowed.includes(session.role)) {
    redirect("/portal?denied=1");
  }

  return session;
}

export async function requireSession(redirectTo?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/portal/login${next}`);
  }
  return session;
}
