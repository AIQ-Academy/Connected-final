/**
 * Shared locale plumbing usable from both Server and Client Components.
 * The cookie is the single source of truth for the *server-rendered*
 * locale; the client provider mirrors it into localStorage for a quick
 * client-side default and keeps the cookie in sync with server rendering.
 */

export type Locale = "en" | "ar" | "fr";
export const locales: Locale[] = ["en", "fr", "ar"];
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as string[]).includes(value);
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Builds the public URL for a locale while keeping English paths unchanged. */
export function localizedPath(pathname: string, locale: Locale): string {
  const path = pathname.replace(/^\/(?:ar|fr)(?=\/|$)/, "") || "/";
  if (locale === defaultLocale) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}
