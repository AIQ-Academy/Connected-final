"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { knowledgeGaps } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { allKnowledgeDocuments } from "@/lib/chat/knowledge-retrieval";
import { synchronizeKnowledge } from "@/lib/chat/knowledge-sync";
import { cmsKnowledgeDocuments } from "@/lib/cms/discovery";
import { detectChatLanguage, type ChatLanguage } from "@/lib/chat/language";
import { retrieveKnowledge } from "@/lib/chat/knowledge-retrieval";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { generateLocalAnswer } from "@/lib/chat/local-assistant";
import { understandQuestion } from "@/lib/chat/question-understanding";

export async function reviewKnowledgeGap(formData: FormData) {
  const session = await requireRole("admin");
  const parsed = z.object({ id: z.uuid(), status: z.enum(["reviewed", "dismissed"]) }).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success || !hasDatabase()) return;
  await getDb().update(knowledgeGaps).set({ status: parsed.data.status, reviewedAt: new Date(), reviewedBy: session.userId })
    .where(eq(knowledgeGaps.id, parsed.data.id));
  revalidatePath("/admin/knowledge");
}

export async function syncKnowledgeNow() {
  await requireRole("admin");
  if (!hasDatabase()) return;
  await synchronizeKnowledge([...await allKnowledgeDocuments(), ...await cmsKnowledgeDocuments()]);
  revalidatePath("/admin/knowledge");
}

/** Admin-only retrieval preview. Returns only public website knowledge. */
export async function testKnowledgeSearch(input: { query: string; language?: string }) {
  await requireRole("admin");
  const query = input.query.trim().slice(0, 500);
  if (!query) return { answer: "Enter a question to test search.", records: [] };
  const language = (input.language === "en" || input.language === "fr" || input.language === "ar"
    ? input.language
    : detectChatLanguage(query)) as ChatLanguage;
  const live = await cmsKnowledgeDocuments().catch(() => []);
  const records = await retrieveKnowledge(query, language, 6, live);
  const understanding = understandQuestion(query, language);
  const answer = records.length
    ? await generateLocalAnswer({
      language,
      documents: records,
      systemPrompt: buildSystemPrompt({ language, documents: records, understanding }),
      messages: [{ role: "user", content: query }],
      query,
    })
    : ({
      en: "No sufficiently relevant public website content was retrieved.",
      fr: "Aucun contenu public du site suffisamment pertinent n’a été trouvé.",
      ar: "لم يتم العثور على محتوى عام ذي صلة كافية على الموقع.",
    }[language]);
  return {
    answer,
    records: records.map((record) => ({
      title: record.title,
      route: record.sourceRoutes[0] ?? "/",
      category: record.category,
      language: Object.keys(record.contentByLocale ?? {})[0] ?? language,
      score: "score" in record ? Number(record.score) : null,
      excerpt: record.content.slice(0, 900),
    })),
  };
}
