import { NextResponse } from "next/server";

import { loadQuotes, QUOTES_REVALIDATE_SECONDS } from "@/lib/quotes.server";

export const runtime = "nodejs";
/** Quotes are shared across visitors, so a short shared cache is enough. */
export const revalidate = 5;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const symbols = params.get("symbols");

  const body = await loadQuotes({
    assetClass: params.get("assetClass"),
    symbols: symbols ? symbols.split(",").map((s) => s.trim()) : null,
  });

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": `public, s-maxage=${QUOTES_REVALIDATE_SECONDS}, stale-while-revalidate=30`,
    },
  });
}
