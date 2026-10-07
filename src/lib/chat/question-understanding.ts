import type { ChatLanguage } from "./language.ts";
import { knowledgeTokens } from "./knowledge-index.ts";

export type QuestionIntent = "location" | "process" | "comparison" | "list" | "eligibility" | "pricing" | "policy" | "timing" | "explanation" | "fact";

export type QuestionUnderstanding = {
  language: ChatLanguage;
  intent: QuestionIntent;
  topicTerms: string[];
  entities: string[];
  detailLevel: "specific" | "broad";
};

/** Detect only elliptical follow-ups whose subject must come from chat history. */
export function isContextualFollowUp(text: string) {
  const normalized = text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();
  return /^(?:(?:and|but)\s+)?(?:what about|how about)\s+(?:it|that|this|the same|the first|the second|the last|the other|that one|this one|its|their|pricing|price|cost|fees|rules)\b/u.test(normalized)
    || /^(?:(?:and|but)\s+)?(?:how much\s+(?:is|does)\s+(?:it|that|this)|how much|how many|what is the price|what does it cost)\s*(?:(?:for|of)\s*(?:it|that|this|the first|the second|the same|them))?\s*[?!.]*$/u.test(normalized)
    || /^(?:et\s+)?(?:pour|avec)\s+(?:cela|ca|lui|elle|celui-ci|celle-ci|le premier|la premiere|le deuxieme|la deuxieme|l'autre|le meme|la meme)\b/u.test(normalized)
    || /^(?:و)?(?:كم سعره|كم تكلفته|وماذا عنه|وماذا عنها|ماذا عن ذلك|ماذا عن هذا|والثاني|والأول|والأخرى|وهذا|وهذه)(?=$|\s|[?!.؟])/u.test(normalized);
}

const stopWords = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "what", "which", "who", "where", "when", "why", "how", "can", "could", "would", "please", "tell", "me", "about", "your", "you", "we", "our", "i", "to", "for", "of", "in", "on", "and", "or", "it", "its", "this", "that", "with",
  "le", "la", "les", "un", "une", "des", "du", "de", "d", "est", "sont", "que", "quoi", "quel", "quelle", "quels", "quelles", "qui", "où", "quand", "pourquoi", "comment", "combien", "pouvez", "vous", "votre", "vos", "je", "me", "mon", "ma", "et", "ou", "dans", "sur", "pour", "avec", "au", "aux",
  "ما", "ماذا", "من", "أين", "اين", "متى", "لماذا", "كيف", "كم", "هل", "يمكن", "لي", "في", "من", "عن", "على", "و", "أو", "مع", "هذا", "هذه", "هو", "هي", "أن", "ماهي", "ماهي",
]);

const intentPatterns: Array<[QuestionIntent, RegExp]> = [
  ["location", /\b(where|located|location|address|headquarters|based)\b|\b(où|adresse|situé|située|localisé|localisée)\b|أين|اين|موقع|مقر|عنوان/iu],
  ["process", /\b(how|process|procedure|steps|work)\b|\b(comment|fonctionne|procédure|étapes)\b|كيف|الخطوات|آلية|يعمل/iu],
  ["comparison", /\b(compare|comparison|difference|versus|vs)\b|\b(comparer|comparaison|différence|différences)\b|مقارنة|الفرق|اختلاف/iu],
  ["eligibility", /\b(can i|am i eligible|eligible|allowed|permitted)\b|\b(puis-je|peux-je|éligible|autorisé|autorisée)\b|هل يمكن|أستطيع|مسموح/iu],
  ["pricing", /\b(price|pricing|cost|costs|fee|fees|commission|commissions)\b|\b(prix|coût|coûts|frais|commission)\b|سعر|أسعار|تكلفة|تكاليف|رسوم|عمولة/iu],
  ["policy", /\b(rule|rules|condition|conditions|policy|policies|requirement|requirements)\b|\b(règle|règles|condition|conditions|politique|exigence)\b|شروط|قواعد|سياسة|سياسات|متطلبات/iu],
  ["timing", /\b(when|how long|duration|frequency|schedule)\b|\b(quand|combien de temps|durée|fréquence)\b|متى|كم يستغرق|المدة|التكرار/iu],
  ["explanation", /\b(explain|explanation|describe|meaning)\b|\b(explique|explication|décrire|signification)\b|اشرح|شرح|معنى/iu],
  ["list", /\b(which|what are|list|available|types|options)\b|\b(quels sont|quelles sont|liste|disponibles|types|options)\b|ما هي|ماهي|اذكر|قائمة|أنواع|المتاحة/iu],
];

/** Lightweight, language-aware query parsing; the original question is retained for generation. */
export function understandQuestion(text: string, language: ChatLanguage): QuestionUnderstanding {
  const tokens = knowledgeTokens(text);
  const topicTerms = [...new Set(tokens.filter((token) => !stopWords.has(token)))].slice(0, 14);
  const entities = [...new Set([
    ...(text.match(/\b[A-Z][A-Za-z0-9]*(?:[./_-][A-Za-z0-9]+)*\b/gu) ?? []),
    ...(text.match(/\b\d+(?:[.,]\d+)?%?\b/gu) ?? []),
  ])].filter((entity) => !stopWords.has(knowledgeTokens(entity)[0] ?? "")).slice(0, 8);
  const intent = intentPatterns.find(([, pattern]) => pattern.test(text))?.[0] ?? "fact";
  const detailLevel = intent !== "fact" || entities.length > 0 || topicTerms.length <= 2 ? "specific" : "broad";
  return { language, intent, topicTerms, entities, detailLevel };
}
