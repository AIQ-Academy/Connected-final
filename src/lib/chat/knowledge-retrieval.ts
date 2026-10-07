import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { embed } from "ai";
import { getDb, hasDatabase } from "@/db";
import { knowledgeChunks, knowledgeDocuments } from "@/db/schema";

import type { ChatLanguage } from "./language.ts";
import { chunkKnowledgeContent, contentHash, cosineSimilarity, knowledgeTokens as tokenize } from "./knowledge-index.ts";
import { expandDomainTerms } from "./domain-terms.ts";
import { understandQuestion } from "./question-understanding.ts";

export type KnowledgeDocument = {
  id: string;
  category: string;
  title: string;
  keywords: Record<ChatLanguage, string[]>;
  content: string;
  contentByLocale?: Partial<Record<ChatLanguage, string>>;
  summary: Partial<Record<ChatLanguage, string>>;
  sourceRoutes: string[];
  sourceFiles: string[];
  parentPage?: string | null;
  sections?: string[];
  relatedIds?: string[];
  origin?: "curated" | "generated";
  contentVersion?: string;
};

let documentsPromise: Promise<KnowledgeDocument[]> | undefined;

async function loadDocuments() {
  documentsPromise ??= readFile(
    join(process.cwd(), "knowledge", "index.json"),
    "utf8",
  ).then((source) => {
    const parsed = JSON.parse(source) as { documents?: KnowledgeDocument[] };
    if (!Array.isArray(parsed.documents)) {
      throw new Error("Knowledge index has no documents array");
    }
    return parsed.documents;
  });
  return documentsPromise;
}

export async function allKnowledgeDocuments() {
  return loadDocuments();
}

export function knowledgeTokens(text: unknown) {
  return tokenize(text);
}

const intentSearchTerms = {
  location: ["location", "address", "based", "موقع", "عنوان", "مقر", "adresse", "situé"],
  process: ["process", "steps", "procedure", "خطوات", "آلية", "procédure", "étapes"],
  comparison: ["comparison", "difference", "versus", "مقارنة", "الفرق", "comparaison", "différence"],
  list: ["options", "types", "available", "أنواع", "قائمة", "options", "disponibles"],
  eligibility: ["eligible", "allowed", "مسموح", "éligible", "autorisé"],
  pricing: ["price", "cost", "fees", "commission", "سعر", "رسوم", "prix", "frais"],
  policy: ["rules", "conditions", "requirements", "شروط", "متطلبات", "règles", "conditions"],
  timing: ["when", "duration", "frequency", "متى", "المدة", "quand", "durée"],
  explanation: ["explanation", "meaning", "شرح", "معنى", "explication", "signification"],
  fact: [],
} as const;

/** Deterministic retrieval over the source-generated and curated website corpus. */
export async function retrieveKnowledge(
  query: string,
  language: ChatLanguage,
  limit = 4,
  additionalDocuments: KnowledgeDocument[] = [],
) {
  const understanding = understandQuestion(query, language);
  const originalTerms = [...new Set(understanding.topicTerms)];
  const focusedQuery = [...originalTerms, ...understanding.entities, ...intentSearchTerms[understanding.intent]].join(" ");
  const searchTerms = expandDomainTerms(focusedQuery, language);
  if (!searchTerms.length) return [];
  const effectiveLimit = Math.min(limit, understanding.detailLevel === "specific" ? 2 : 4);
  const documents = [...await loadDocuments(), ...additionalDocuments];
  const candidates = documents.flatMap((document) => {
    const localized = Object.entries(document.contentByLocale ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string");
    const bodies = (localized.length ? localized : [["en", typeof document.content === "string" ? document.content : ""]]) as Array<[ChatLanguage, string]>;
    const keywordValues = Object.values(document.keywords ?? {}).flatMap((value) =>
      Array.isArray(value) ? value.filter((keyword): keyword is string => typeof keyword === "string") : [],
    );
    const keywordSet = new Set(keywordValues.flatMap(knowledgeTokens));
    const titleSet = new Set(knowledgeTokens(document.title));
    const routeSet = new Set(knowledgeTokens((document.sourceRoutes ?? []).filter((route) => typeof route === "string").join(" ")));
    return bodies.flatMap(([sourceLanguage, body]) => chunkKnowledgeContent(body, 1_100, 140).map((chunk, ordinal) => ({
      document, sourceLanguage, chunk, ordinal, titleSet, keywordSet, routeSet,
      chunkSet: new Set(knowledgeTokens(chunk)),
    })));
  });
  const documentFrequency = new Map<string, number>();
  for (const candidate of candidates) for (const term of new Set(searchTerms.filter((token) => candidate.chunkSet.has(token) || candidate.titleSet.has(token) || candidate.keywordSet.has(token) || candidate.routeSet.has(token)))) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
  const rankedLexical = candidates.map((candidate) => {
    let score = 0;
    let matchedTopics = 0;
    for (const topic of originalTerms) {
      const variants = expandDomainTerms(topic, language);
      const inTitle = variants.some((token) => candidate.titleSet.has(token));
      const inKeywords = variants.some((token) => candidate.keywordSet.has(token));
      const inChunk = variants.some((token) => candidate.chunkSet.has(token));
      const inRoute = variants.some((token) => candidate.routeSet.has(token));
      const isEntity = understanding.entities.some((entity) => knowledgeTokens(entity).some((token) => variants.includes(token)));
      if (inTitle || inKeywords || inChunk || inRoute) matchedTopics++;
      if (isEntity && inChunk) score += 3;
    }
    for (const term of searchTerms) {
      const titleMatch = candidate.titleSet.has(term);
      const keywordMatch = candidate.keywordSet.has(term);
      const chunkMatch = candidate.chunkSet.has(term);
      const routeMatch = candidate.routeSet.has(term);
      if (!titleMatch && !keywordMatch && !chunkMatch && !routeMatch) continue;
      const idf = Math.log(1 + (candidates.length + 0.5) / ((documentFrequency.get(term) ?? 0) + 0.5));
      score += idf * ((titleMatch ? 3.5 : 0) + (keywordMatch ? 2.2 : 0) + (chunkMatch ? 1.5 : 0) + (routeMatch ? 0.7 : 0));
    }
    const coverage = matchedTopics / Math.max(1, originalTerms.length);
    score += coverage * 1.5;
    return { ...candidate, score, coverage, matchedTopics };
  }).filter((candidate) => candidate.matchedTopics > 0 && candidate.score >= 2.5)
    .sort((a, b) => b.score - a.score || b.coverage - a.coverage);

  const lexical = selectFocusedChunks(rankedLexical.slice(0, effectiveLimit * 3).map((candidate) => ({
    ...candidate.document,
    content: candidate.chunk,
    contentByLocale: { [candidate.sourceLanguage]: candidate.chunk },
    sourceRoutes: Array.isArray(candidate.document.sourceRoutes) ? candidate.document.sourceRoutes.filter((route): route is string => typeof route === "string") : [],
    sections: [],
    score: candidate.score,
    chunkKey: `${candidate.document.id}:${candidate.sourceLanguage}:${candidate.ordinal}:${contentHash(candidate.chunk).slice(0, 12)}`,
  })), effectiveLimit);

  // Optional multilingual semantic retrieval. Vectors are created only during
  // content synchronization; a query costs one embedding call and reads chunks.
  if (!hasDatabase() || !(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)) return lexical;
  try {
    const queryVector = (await embed({ model: process.env.KNOWLEDGE_EMBEDDING_MODEL ?? "openai/text-embedding-3-small", value: query })).embedding;
    const rows = await getDb().select({
      id: knowledgeDocuments.sourceKey, title: knowledgeDocuments.title, sourceUrl: knowledgeDocuments.sourceUrl,
      section: knowledgeDocuments.section, language: knowledgeDocuments.language, sourceType: knowledgeDocuments.sourceType,
      content: knowledgeChunks.content, embedding: knowledgeChunks.embedding,
    }).from(knowledgeChunks).innerJoin(knowledgeDocuments, eq(knowledgeChunks.documentId, knowledgeDocuments.id));
    const semantic = rows.flatMap((row) => {
      const vector = row.embedding as number[] | null;
      if (!vector) return [];
      const score = cosineSimilarity(queryVector, vector);
      if (score < 0.3) return [];
      const sourceId = row.id.slice(0, row.id.lastIndexOf(":"));
      const sourceLanguage = row.language as ChatLanguage;
      const doc: KnowledgeDocument = {
        id: sourceId, category: row.sourceType, title: row.title,
        keywords: { en: [], fr: [], ar: [] }, content: row.content,
        contentByLocale: { [sourceLanguage]: row.content },
        summary: { en: row.content.slice(0, 220), fr: row.content.slice(0, 220), ar: row.content.slice(0, 220) },
        sourceRoutes: [row.sourceUrl], sourceFiles: [row.sourceType], sections: row.section ? [row.section] : [],
      };
      return [{ ...doc, score: score * 10, chunkKey: `${row.id}:${contentHash(row.content).slice(0, 12)}` }];
    }).sort((a, b) => b.score - a.score).slice(0, effectiveLimit * 2);
    const merged = new Map<string, KnowledgeDocument & { score: number; chunkKey?: string }>();
    for (const item of [...lexical, ...semantic]) {
      const key = `${item.id}:${item.sourceRoutes[0] ?? ""}:${contentHash(item.content)}`;
      const prior = merged.get(key);
      if (!prior || prior.score < item.score) merged.set(key, item);
    }
    return selectFocusedChunks([...merged.values()].sort((a, b) => b.score - a.score), effectiveLimit);
  } catch (error) {
    console.warn("[knowledge] semantic retrieval unavailable; using lexical matches", error);
    return lexical;
  }
}

function selectFocusedChunks<T extends KnowledgeDocument & { score: number; chunkKey?: string }>(documents: T[], limit: number) {
  const selected: T[] = [];
  const documentCount = new Map<string, number>();
  const seen = new Set<string>();
  for (const document of documents) {
    const key = `${document.id}:${document.sourceRoutes[0] ?? ""}:${contentHash(document.content)}`;
    if (seen.has(key) || (documentCount.get(document.id) ?? 0) >= 2) continue;
    seen.add(key);
    documentCount.set(document.id, (documentCount.get(document.id) ?? 0) + 1);
    selected.push(document);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function knowledgeFallback(
  documents: KnowledgeDocument[],
  language: ChatLanguage,
) {
  if (!documents.length) return unknownInformation(language);
  return documents
    .slice(0, 3)
    .map((document) => `${document.summary[language] ?? document.summary.en ?? document.content} (${document.sourceRoutes.join(", ")})`)
    .join("\n\n");
}

export function unknownInformation(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "I don’t have that information in the website’s published content. I can help with Connect Funded accounts, markets, platforms, payments, and support. For anything account-specific, contact support@connectfunded.com.",
    fr: "Je ne trouve pas cette information dans le contenu publié du site. Je peux vous renseigner sur les comptes Connect Funded, les marchés, les plateformes, les paiements et l’assistance. Pour une question liée à votre compte, écrivez à support@connectfunded.com.",
    ar: "لا أجد هذه المعلومة ضمن محتوى الموقع المنشور. يمكنني المساعدة بشأن حسابات Connect Funded والأسواق والمنصات والمدفوعات والدعم. للاستفسارات الخاصة بحسابك، راسل support@connectfunded.com.",
  };
  return replies[language];
}

export function assistantUnavailable(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "The assistant can share the published information below, but its AI response service is not configured yet. Ask the site administrator to add the server-side AI Gateway key.",
    fr: "L’assistant peut partager les informations publiées ci-dessous, mais son service de réponse par IA n’est pas encore configuré. L’administrateur du site doit ajouter la clé AI Gateway côté serveur.",
    ar: "يمكن للمساعد عرض المعلومات المنشورة أدناه، لكن خدمة الإجابة بالذكاء الاصطناعي لم تُضبط بعد. على مسؤول الموقع إضافة مفتاح AI Gateway إلى إعدادات الخادم.",
  };
  return replies[language];
}

export function assistantFailure(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "The live assistant is temporarily unavailable. The published details above are still available; please try again shortly or contact support@connectfunded.com.",
    fr: "L’assistant est temporairement indisponible. Les informations publiées ci-dessus restent disponibles ; réessayez dans quelques instants ou écrivez à support@connectfunded.com.",
    ar: "المساعد المباشر غير متاح مؤقتاً. ما زالت المعلومات المنشورة أعلاه متاحة؛ يرجى المحاولة بعد قليل أو مراسلة support@connectfunded.com.",
  };
  return replies[language];
}

export function offTopicReply(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "I’m the Connect Funded website assistant, so I’m best placed to help with our accounts, trading products, platforms, payments, and site support. What would you like to know about those?",
    fr: "Je suis l’assistant du site Connect Funded. Je peux surtout vous aider sur nos comptes, produits de trading, plateformes, paiements et services d’assistance. Que souhaitez-vous savoir à ce sujet ?",
    ar: "أنا مساعد موقع Connect Funded، ويمكنني المساعدة بشكل أفضل بشأن الحسابات ومنتجات التداول والمنصات والمدفوعات والدعم. ما الذي تود معرفته عنها؟",
  };
  return replies[language];
}

export function isClearlyOffTopic(message: string) {
  const tokens = new Set(knowledgeTokens(message));
  const businessTokens = [
    "connect", "funded", "trade", "trading", "market", "markets", "account", "accounts",
    "forex", "gold", "crypto", "broker", "platform", "payment", "deposit", "withdrawal",
    "support", "register", "fund", "evaluation", "payout", "spread", "margin", "leverage",
    "entreprise", "marche", "marches", "compte", "comptes", "trading", "inscription", "retrait",
    "سوق", "الأسواق", "تداول", "حساب", "حسابات", "دعم", "منصة", "إيداع", "سحب", "تمويل",
  ];
  return !businessTokens.some((token) => tokens.has(token));
}
