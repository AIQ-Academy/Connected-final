import { generateText } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { traderJournalEntries } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({ locale: z.enum(["en", "fr", "ar"]) });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sign in to request a private trade review." }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ message: "Journal storage is not configured yet." }, { status: 503 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ message: "Choose a report language and try again." }, { status: 400 }); }
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ message: "Choose a supported report language." }, { status: 400 });

  try {
    const rows = await getDb().select().from(traderJournalEntries)
      .where(eq(traderJournalEntries.userId, session.userId))
      .orderBy(desc(traderJournalEntries.tradedAt)).limit(200);
    if (!rows.length) return NextResponse.json({ message: "Add completed trades first. The review uses only your saved journal records." }, { status: 409 });

    const facts = rows.map((trade) => ({
      date: trade.tradedAt.toISOString().slice(0, 10),
      asset: trade.symbol,
      direction: trade.direction,
      strategy: trade.strategy,
      timeframe: trade.timeframe,
      entry: trade.entryPrice,
      exit: trade.exitPrice,
      size: trade.positionSize,
      result: trade.profitLoss,
      resultCurrency: trade.profitLossCurrency,
      plannedStopDistance: Math.abs(trade.entryPrice - trade.stopLoss),
      plannedTargetDistance: Math.abs(trade.takeProfit - trade.entryPrice),
      marketCondition: trade.marketCondition,
      entryReason: trade.entryReason,
      exitReason: trade.exitReason,
      emotion: trade.emotion,
      notes: trade.notes,
    }));
    const languageName = { en: "English", fr: "French", ar: "Arabic" }[parsed.data.locale];
    const system = `You are a careful trading-journal review assistant. Analyze ONLY the supplied user journal records. Never invent missing history, current market data, prices, or performance claims. Keep result amounts in their recorded currencies; never add or compare results across unlike currencies. Separate observations from uncertainty. Give concise sections: Strengths, Patterns to review, Practical next step. This is educational reflection, not financial advice or a recommendation to enter a trade. Answer in ${languageName}.`;
    const prompt = JSON.stringify(facts);

    if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
      const result = await generateText({
        model: process.env.CHAT_MODEL ?? "google/gemini-3.6-flash",
        system,
        prompt,
        maxOutputTokens: 700,
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(45_000),
      });
      if (result.text.trim()) return NextResponse.json({ review: result.text.trim(), tradesAnalyzed: rows.length });
    }

    const localUrl = process.env.LOCAL_CHAT_URL ?? "http://127.0.0.1:11434/api/chat";
    const url = new URL(localUrl);
    if (url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname.replace(/^\[|\]$/gu, ""))) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.LOCAL_CHAT_MODEL || "qwen2.5:7b", stream: false, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], options: { temperature: 0.2, num_ctx: 8192 } }),
        cache: "no-store",
        signal: AbortSignal.timeout(50_000),
      });
      if (response.ok) {
        const payload = await response.json() as { message?: { content?: unknown } };
        if (typeof payload.message?.content === "string" && payload.message.content.trim()) {
          return NextResponse.json({ review: payload.message.content.trim(), tradesAnalyzed: rows.length });
        }
      }
    }
    return NextResponse.json({ message: "AI review is unavailable. Configure the AI Gateway or start the local model, then try again." }, { status: 503 });
  } catch (error) {
    console.error("[trading-edge/review] failed", error);
    return NextResponse.json({ message: "Could not prepare the review right now." }, { status: 503 });
  }
}
