import { NextResponse, type NextRequest } from "next/server";

import { isLocale, LOCALE_COOKIE, localizedPath } from "./lib/i18n/locale";

function canonicalLegacyPath(pathname: string) {
  if (pathname === "/index.html") return "/";
  if (pathname === "/accounts.html" || pathname === "/accounts") return "/trading/accounts";
  if (pathname === "/how-it-works") return "/trading/how-it-works";
  if (pathname === "/platforms.html") return "/platforms";
  if (pathname === "/education.html") return "/education";
  if (pathname === "/contact.html") return "/contact";
  if (pathname === "/about.html") return "/about";
  if (pathname === "/funded" || pathname.startsWith("/funded/")) return "/trade";
  if (pathname === "/broker") return "/trading";
  if (pathname.startsWith("/broker/")) return pathname.replace(/^\/broker/, "/trading");
  return pathname;
}

/**
 * Locale-prefixed URLs provide stable, crawlable language variants. The
 * application routes remain shared; the locale is forwarded to server
 * rendering and persisted for links that do not include a prefix.
 */
export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const requestedLocale = segments[1];
  if (!isLocale(requestedLocale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-connect-path", request.nextUrl.pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const pathname = `/${segments.slice(2).join("/")}` || "/";
  if (requestedLocale === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url, 308);
    response.cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }
  if (pathname === "/register") {
    return NextResponse.redirect(
      "https://portal.bbcorp.trade/auth/jwt/sign-up/b/72nzf8/prod/BPOM9S",
      307,
    );
  }
  const canonicalPath = canonicalLegacyPath(pathname);
  if (canonicalPath !== pathname) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = localizedPath(canonicalPath, requestedLocale);
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-connect-locale", requestedLocale);
  requestHeaders.set("x-connect-path", pathname);
  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, requestedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
