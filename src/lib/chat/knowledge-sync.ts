import "server-only";

import { embedMany } from "ai";
import { eq } from "drizzle-orm";

import { getDb, hasDatabase } from "@/db";
import { knowledgeChunks, knowledgeDocuments, knowledgeSyncRuns } from "@/db/schema";
import type { KnowledgeDocument } from "@/lib/chat/knowledge-retrieval";
import { chunkKnowledgeContent, contentHash, type IndexedSource } from "@/lib/chat/knowledge-index";

const EMBEDDING_MODEL = process.env.KNOWLEDGE_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

function toSources(documents: KnowledgeDocument[]): IndexedSource[] {
  const result: IndexedSource[] = [];
  for (const document of documents) {
    const languages = Object.entries(document.contentByLocale ?? {}) as Array<["en" | "fr" | "ar", string]>;
    const versions = languages.length ? languages : [["en", document.content] as ["en", string]];
    for (const [language, localized] of versions) {
      const content = [document.title, ...(document.sections ?? []), localized].filter(Boolean).join("\n\n");
      const file = document.sourceFiles[0] ?? "Website";
      const sourceType: IndexedSource["sourceType"] = file.startsWith("Database:published_faqs") ? "faq"
        : file.startsWith("Database:active_market") ? "market"
          : file.startsWith("Database:published_news") ? "news"
            : file.startsWith("CMS:") ? "cms" : "website";
      result.push({
        id: document.id, title: document.title, content, language,
        sourceUrl: document.sourceRoutes[0] ?? "/", section: document.sections?.join(" · "), sourceType,
      });
    }
  }
  return result;
}

/** Hash-checks every source and only re-chunks/re-embeds changed localized documents. */
export async function synchronizeKnowledge(documents: KnowledgeDocument[]) {
  if (!hasDatabase()) return { available: false, checked: documents.length, added: 0, changed: 0, removed: 0, chunks: 0, embeddings: 0 };
  const db = getDb();
  const sources = toSources(documents);
  const run = await db.insert(knowledgeSyncRuns).values({ status: "running", documentsChecked: sources.length }).returning({ id: knowledgeSyncRuns.id });
  const runId = run[0]?.id;
  let added = 0; let changed = 0; let removed = 0; let chunksUpdated = 0; let embeddingsUpdated = 0;
  let syncError: string | null = null;
  try {
    const existing = await db.select().from(knowledgeDocuments);
    const currentChunks = await db.select({ documentId: knowledgeChunks.documentId, embeddingModel: knowledgeChunks.embeddingModel }).from(knowledgeChunks);
    const chunkCounts = new Map<string, number>();
    const outdatedEmbeddingCounts = new Map<string, number>();
    for (const chunk of currentChunks) {
      chunkCounts.set(chunk.documentId, (chunkCounts.get(chunk.documentId) ?? 0) + 1);
      if (chunk.embeddingModel !== EMBEDDING_MODEL) outdatedEmbeddingCounts.set(chunk.documentId, (outdatedEmbeddingCounts.get(chunk.documentId) ?? 0) + 1);
    }
    const byKey = new Map(existing.map((row) => [row.sourceKey, row]));
    const sourceKeys = sources.map((source) => `${source.id}:${source.language}`);
    const pending = sources.map((source) => {
      const sourceKey = `${source.id}:${source.language}`;
      const hash = contentHash(`${source.title}\n${source.sourceUrl}\n${source.section ?? ""}\n${source.content}`);
      const prior = byKey.get(sourceKey);
      const chunks = chunkKnowledgeContent(source.content);
      const changedContent = prior?.contentHash !== hash;
      const incompleteChunks = Boolean(prior && chunkCounts.get(prior.id) !== chunks.length);
      const needsEmbeddings = Boolean(prior && (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) && (outdatedEmbeddingCounts.get(prior.id) ?? 0) > 0);
      return { source, sourceKey, hash, prior, chunks, changedContent, needsUpdate: changedContent || incompleteChunks || needsEmbeddings };
    }).filter((entry) => entry.needsUpdate);
    const embeddingInputs = pending.flatMap((entry) => entry.chunks);
    let allVectors: number[][] = [];
    if (embeddingInputs.length && (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)) {
      try {
        // Bound each provider batch so a large first sync stays within request limits.
        for (let start = 0; start < embeddingInputs.length; start += 64) {
          const batch = await embedMany({ model: EMBEDDING_MODEL, values: embeddingInputs.slice(start, start + 64) });
          allVectors.push(...batch.embeddings);
        }
        embeddingsUpdated = allVectors.length;
      } catch (error) {
        allVectors = [];
        syncError = "Embedding provider unavailable; check server configuration.";
        console.warn("[knowledge] embeddings unavailable; storing lexical chunks", error);
      }
    }
    let vectorOffset = 0;
    for (const entry of pending) {
      const { source, sourceKey, hash, prior, chunks, changedContent } = entry;
      const vectors = allVectors.slice(vectorOffset, vectorOffset + chunks.length);
      vectorOffset += chunks.length;
      const documentValues = {
        sourceUrl: source.sourceUrl, title: source.title, section: source.section ?? null,
        language: source.language, content: source.content, contentHash: hash,
        sourceType: source.sourceType, version: (prior?.version ?? 0) + (changedContent ? 1 : 0),
        indexedAt: new Date(), updatedAt: new Date(),
      };
      let documentId = prior?.id;
      if (prior) {
        if (changedContent) changed++;
        if (changedContent) await db.update(knowledgeDocuments).set(documentValues).where(eq(knowledgeDocuments.id, prior.id));
        await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, prior.id));
      } else {
        added++;
        const [inserted] = await db.insert(knowledgeDocuments).values({ sourceKey, ...documentValues }).returning({ id: knowledgeDocuments.id });
        documentId = inserted.id;
      }
      if (!documentId) continue;
      if (chunks.length) {
        await db.insert(knowledgeChunks).values(chunks.map((content, ordinal) => ({
          documentId: documentId!, chunkKey: `${sourceKey}:${ordinal}:${contentHash(content).slice(0, 16)}`,
          ordinal, content, contentHash: contentHash(content),
          embedding: vectors[ordinal] ?? null, embeddingModel: vectors[ordinal] ? EMBEDDING_MODEL : null,
        })));
        chunksUpdated += chunks.length;
      }
    }
    if (sourceKeys.length) {
      const stale = existing.filter((row) => !sourceKeys.includes(row.sourceKey)).map((row) => row.id);
      if (stale.length) {
        for (const id of stale) await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
        removed = stale.length;
      }
    } else {
      removed = existing.length;
      for (const row of existing) await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, row.id));
    }
    if (runId) await db.update(knowledgeSyncRuns).set({ status: syncError ? "completed_with_warnings" : "completed", documentsChecked: sources.length, documentsAdded: added, documentsChanged: changed, documentsRemoved: removed, chunksUpdated, embeddingsUpdated, error: syncError, completedAt: new Date() }).where(eq(knowledgeSyncRuns.id, runId));
    return { available: true, checked: sources.length, added, changed, removed, chunks: chunksUpdated, embeddings: embeddingsUpdated };
  } catch (error) {
    const message = "Knowledge synchronization failed. Check server logs.";
    if (runId) await db.update(knowledgeSyncRuns).set({ status: "failed", documentsChecked: sources.length, documentsAdded: added, documentsChanged: changed, documentsRemoved: removed, chunksUpdated, embeddingsUpdated, error: message, completedAt: new Date() }).where(eq(knowledgeSyncRuns.id, runId)).catch(() => undefined);
    throw error;
  }
}
