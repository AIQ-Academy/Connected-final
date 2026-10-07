import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ChatLanguage } from "./language.ts";

type ResponseRule = {
  id: string;
  intent: string;
  keywords: Record<ChatLanguage, string[]>;
  response: Record<ChatLanguage, string>;
};

let rulesPromise: Promise<ResponseRule[]> | undefined;

async function loadRules() {
  rulesPromise ??= readFile(
    join(process.cwd(), "knowledge", "response_rules.json"),
    "utf8",
  ).then((source) => JSON.parse(source) as ResponseRule[]);
  return rulesPromise;
}

function words(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** First matching, curated answer takes priority over retrieval and generation. */
export async function findFixedResponse(
  message: string,
  language: ChatLanguage,
): Promise<{ id: string; text: string } | null> {
  const messageWords = new Set(words(message));
  const normalized = ` ${words(message).join(" ")} `;
  const rules = await loadRules();
  const greetingWords = new Set([
    "hello", "hi", "hey", "good", "morning", "afternoon", "evening",
    "bonjour", "bonsoir", "salut", "coucou", "مرحبا", "السلام", "عليكم", "اهلا",
  ]);
  const hasOnlyGreeting = [...messageWords].every((word) => greetingWords.has(word));

  for (const rule of rules) {
    // A greeting must not swallow a real question that starts with "Hi" or
    // "Good morning"; let those questions continue through retrieval.
    if (rule.id === "greeting" && !hasOnlyGreeting) continue;
    const matched = rule.keywords[language].some((phrase) => {
      const tokens = words(phrase);
      if (!tokens.length) return false;
      if (tokens.length === 1) return messageWords.has(tokens[0]!);
      return normalized.includes(` ${tokens.join(" ")} `);
    });
    if (matched) return { id: rule.id, text: rule.response[language] };
  }
  return null;
}
