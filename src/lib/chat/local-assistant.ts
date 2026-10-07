import "server-only";
import { generateText } from "ai";
import { understandQuestion } from "./question-understanding.ts";

import {
  knowledgeTokens,
  type KnowledgeDocument,
} from "./knowledge-retrieval.ts";
import { expandDomainTerms } from "./domain-terms.ts";
import type { ChatLanguage } from "./language.ts";

type ConversationMessage = { role: "user" | "assistant"; content: string };

/** Calls only a loopback Ollama instance; a remote URL is rejected. */
export async function generateLocalAnswer({
  language,
  documents,
  systemPrompt,
  messages,
  query,
  runtimeFacts,
}: {
  language: ChatLanguage;
  documents: KnowledgeDocument[];
  systemPrompt: string;
  messages: ConversationMessage[];
  query: string;
  runtimeFacts?: string;
}) {
  const fallback = answerFromWebsiteSources(documents, query, language, runtimeFacts);
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    try {
      const result = await generateText({
        model: process.env.CHAT_MODEL ?? "google/gemini-3.6-flash",
        system: systemPrompt,
        messages: messages.slice(-8).map((message) => ({ role: message.role, content: message.content.slice(-1_200) })),
        maxOutputTokens: 700,
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(45_000),
      });
      if (result.text.trim()) return result.text.trim();
    } catch (error) {
      console.warn("[api/chat] AI Gateway unavailable; trying local model", error);
    }
  }
  const endpoint = localChatEndpoint();
  if (!endpoint) return fallback;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.LOCAL_CHAT_MODEL || "qwen2.5:7b",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-8).map((message) => ({
            role: message.role,
            content: message.content.slice(-1_200),
          })),
        ],
        stream: false,
        think: false,
        options: { temperature: 0.15, num_ctx: 12_288 },
      }),
      signal: AbortSignal.timeout(75_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Local model returned HTTP ${response.status}`);
    const payload = await response.json() as { message?: { content?: unknown } };
    const answer = typeof payload.message?.content === "string" ? payload.message.content.trim() : "";
    if (answer) return answer;
    throw new Error("Local model returned an empty answer");
  } catch (error) {
    console.warn("[api/chat] local model unavailable; answering from retrieved site content", error);
    return fallback;
  }
}

function localChatEndpoint() {
  const configured = process.env.LOCAL_CHAT_URL || "http://127.0.0.1:11434/api/chat";
  try {
    const url = new URL(configured);
    const host = url.hostname.replace(/^\[|\]$/gu, "").toLowerCase();
    if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "::1"].includes(host)) {
      console.error("[api/chat] LOCAL_CHAT_URL must point to a loopback address");
      return null;
    }
    return url.toString();
  } catch {
    console.error("[api/chat] LOCAL_CHAT_URL is invalid");
    return null;
  }
}

/** Grounded, useful answer if Ollama is missing, still starting, or offline. */
export function answerFromWebsiteSources(
  documents: KnowledgeDocument[],
  query: string,
  language: ChatLanguage,
  runtimeFacts?: string,
) {
  const queryTokens = new Set(expandDomainTerms(query, language));
  const blocks = documents.map((document) => {
    // Dynamic CMS/FAQ records may only have an English source. Keep that
    // verified source available so the assistant can answer in the visitor's
    // language instead of silently treating the record as empty.
    const body = document.contentByLocale?.[language]
      ?? document.contentByLocale?.en
      ?? document.content;
    if (!body) return null;
    const lines = body.split(/[\n.!?؟]+/u).map((line) => line.replace(/\s+/gu, " ").trim()).filter((line) => line.length >= 20);
    const ranked = lines.map((line) => {
      const tokens = new Set(expandDomainTerms(line, language));
      const overlap = [...queryTokens].filter((token) => tokens.has(token)).length;
      return { line, score: overlap };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    const selected = ranked.slice(0, 2).map((item) => item.line);
    const content = selected.length ? selected.join(". ") : lines.slice(0, 2).join(". ");
    return { document, content, score: ranked[0]?.score ?? 0 };
  }).filter((block) => block !== null).sort((a, b) => b.score - a.score);

  const selected = blocks.filter((block) => block.content && block.score > 0).slice(0, 2);
  const focused = selected.length ? selected : blocks.filter((block) => block.content).slice(0, 1);
  if (!focused.length) return localizedNoMatch(language);
  const sourceAnswer = focused.map(({ document, content }) => {
    const route = document.sourceRoutes.find((item) => item.startsWith("/"));
    return `${document.title}\n${content}${route ? `\n${localizedSource(language)}: ${route}` : ""}`;
  }).join("\n\n");
  const hasEnglishOnlySource = language !== "en"
    && focused.some(({ document }) => !document.contentByLocale?.[language]);
  const localizedSourceNotice = !hasEnglishOnlySource
    ? ""
    : language === "fr"
    ? "Le contenu source vérifié est présenté ci-dessous (source anglaise lorsqu’aucune version française n’est publiée) :\n"
    : language === "ar"
      ? "يُعرض أدناه المحتوى الموثق من المصدر (بالإنجليزية عند عدم توفر نسخة عربية منشورة):\n"
      : "";
  const localizedSourceAnswer = `${localizedSourceNotice}${sourceAnswer}`;
  if (!runtimeFacts) return localizedSourceAnswer;
  const dataLabel = { en: "Current verified site data", fr: "Données vérifiées actuelles du site", ar: "بيانات الموقع الموثقة الحالية" }[language];
  return `${localizedSourceAnswer}\n\n${dataLabel}\n${runtimeFacts}`;
}

function localizedSource(language: ChatLanguage) {
  return { en: "Website page", fr: "Page du site", ar: "صفحة الموقع" }[language];
}

function localizedNoMatch(language: ChatLanguage) {
  return {
    en: "I couldn’t find a verified answer in the website content. You can browse the FAQ at /faq or contact support@connectfunded.com.",
    fr: "Je n’ai pas trouvé de réponse vérifiée dans le contenu du site. Consultez la FAQ sur /faq ou contactez support@connectfunded.com.",
    ar: "لم أجد إجابة موثقة في محتوى الموقع. يمكنك مراجعة الأسئلة الشائعة على /faq أو مراسلة support@connectfunded.com.",
  }[language];
}
