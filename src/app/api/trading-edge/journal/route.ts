import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { traderJournalEntries } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const tradeSchema = z.object({
  tradedAt: z.string().datetime(),
  symbol: z.string().trim().min(2).max(24),
  direction: z.enum(["BUY", "SELL"]),
  strategy: z.string().trim().min(1).max(80),
  timeframe: z.string().trim().min(1).max(20),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive(),
  positionSize: z.number().positive(),
  profitLoss: z.number().finite(),
  profitLossCurrency: z.string().regex(/^[A-Z]{3}$/),
  marketCondition: z.string().max(120).optional(),
  entryReason: z.string().max(1000).optional(),
  exitReason: z.string().max(1000).optional(),
  emotion: z.string().max(80).optional(),
  notes: z.string().max(4000).optional(),
  screenshotUrl: z.string().url().max(2000).optional().or(z.literal("")),
}).superRefine((trade, context) => {
  const buyLevelsValid = trade.stopLoss < trade.entryPrice && trade.takeProfit > trade.entryPrice;
  const sellLevelsValid = trade.stopLoss > trade.entryPrice && trade.takeProfit < trade.entryPrice;
  if (trade.direction === "BUY" ? !buyLevelsValid : !sellLevelsValid) {
    context.addIssue({ code: "custom", path: ["stopLoss"], message: "Stop and target must match the trade direction." });
  }
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sign in to view your journal." }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ message: "Journal storage is not configured yet." }, { status: 503 });
  try {
    const rows = await getDb().select().from(traderJournalEntries)
      .where(eq(traderJournalEntries.userId, session.userId))
      .orderBy(desc(traderJournalEntries.tradedAt)).limit(500);
    return NextResponse.json({ trades: rows });
  } catch (error) {
    console.error("[trading-edge/journal] read failed", error);
    return NextResponse.json({ message: "Journal storage is not ready. Apply the latest database schema and try again." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sign in to add a journal entry." }, { status: 401 });
  const limit = rateLimit(`journal:${session.userId}:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ message: "Please wait a moment before adding another trade." }, { status: 429 });
  if (!hasDatabase()) return NextResponse.json({ message: "Journal storage is not configured yet." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "The trade details could not be read." }, { status: 400 }); }
  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Check the required trade details and try again." }, { status: 400 });
  const input = parsed.data;
  try {
    const [trade] = await getDb().insert(traderJournalEntries).values({
      userId: session.userId,
      ...input,
      tradedAt: new Date(input.tradedAt),
      screenshotUrl: input.screenshotUrl || null,
    }).returning();
    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("[trading-edge/journal] save failed", error);
    return NextResponse.json({ message: "Could not save the trade. Confirm the database schema is up to date." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sign in to manage your journal." }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ message: "Journal storage is not configured yet." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ message: "Choose a valid journal entry." }, { status: 400 });
  try {
    await getDb().delete(traderJournalEntries).where(and(eq(traderJournalEntries.id, id), eq(traderJournalEntries.userId, session.userId)));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[trading-edge/journal] delete failed", error);
    return NextResponse.json({ message: "Could not remove the trade." }, { status: 503 });
  }
}
