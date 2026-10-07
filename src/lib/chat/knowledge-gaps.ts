import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";

import { getDb, hasDatabase } from "@/db";
import { knowledgeGaps } from "@/db/schema";
import type { ChatLanguage } from "@/lib/chat/language";

/** Store only unanswered questions, with common direct identifiers redacted. */
export async function recordKnowledgeGap(question: string, language: ChatLanguage, route?: string) {
  if (!hasDatabase()) return;
  const sanitized = question
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gu, "[email]")
    .replace(/(?:\+?\d[\d ()-]{7,}\d)/gu, "[phone]")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 1000);
  if (sanitized.length < 4) return;
  const questionHash = createHash("sha256").update(sanitized.toLocaleLowerCase()).digest("hex");
  await getDb().insert(knowledgeGaps).values({
    questionHash,
    question: sanitized,
    language,
    route: route?.startsWith("/") ? route.slice(0, 180) : null,
  }).onConflictDoUpdate({
    target: [knowledgeGaps.questionHash, knowledgeGaps.status],
    set: { occurrences: sql`${knowledgeGaps.occurrences} + 1`, lastSeenAt: new Date() },
  });
}
