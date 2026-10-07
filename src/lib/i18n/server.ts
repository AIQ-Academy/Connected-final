import "server-only";
import { cookies, headers } from "next/headers";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./locale";

/**
 * Reads the visitor's locale from the `NEXT_LOCALE` cookie for use in
 * Server Components, Route Handlers and Server Actions. Falls back to
 * English when the cookie is absent (first visit) or holds a stale value.
 *
 * Calling this opts the caller into dynamic rendering (`cookies()` marks
 * the route dynamic) — expected for any page whose text depends on the
 * visitor's chosen language.
 */
export async function getServerLocale(): Promise<Locale> {
  // A locale-prefixed request takes precedence over a previously saved cookie.
  const requestHeaders = await headers();
  const pathLocale = requestHeaders.get("x-connect-locale");
  if (isLocale(pathLocale)) return pathLocale;

  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
