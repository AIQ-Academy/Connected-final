export type ChatLanguage = "en" | "fr" | "ar";

const frenchMarkers = new Set([
  "bonjour", "bonsoir", "merci", "quel", "quelle", "quels", "quelles",
  "comment", "combien", "pourquoi", "proposez", "marche", "marches",
  "compte", "comptes", "retrait", "retraits", "depot", "depots",
  "plateforme", "plateformes", "frais", "inscription", "offrez", "offre",
  "estce", "pouvez", "suis", "sont", "avec", "dans", "pour", "votre",
  "vos", "et", "les", "des", "une", "un", "prix", "equipe",
]);

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[’']/g, " ");
}

/** Detects the language of the latest message, not the start of the thread. */
export function detectChatLanguage(text: string): ChatLanguage {
  const normalized = normalize(text);

  if (
    /(?:reply|respond|answer|write|speak)\s+(?:to\s+me\s+)?in\s+arabic\b|\ben arabe\b|\bbil arabiyya\b|بالعربية|باللغة العربية|رد بالعربية/u.test(normalized)
  ) return "ar";
  if (
    /(?:reply|respond|answer|write|speak)\s+(?:to\s+me\s+)?in\s+french\b|\ben francais\b|بالفرنسية|باللغة الفرنسية/u.test(normalized)
  ) return "fr";
  if (
    /(?:reply|respond|answer|write|speak)\s+(?:to\s+me\s+)?in\s+english\b|\bin english\b|\ben anglais\b|بالإنجليزية|باللغة الإنجليزية/u.test(normalized)
  ) return "en";

  if (/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(text)) return "ar";

  const tokens = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const frenchScore = tokens.reduce(
    (score, token) => score + (frenchMarkers.has(token) ? 1 : 0),
    0,
  );
  const hasFrenchAccent = /[àâæçéèêëîïôœùûüÿ]/iu.test(text);

  return hasFrenchAccent || frenchScore >= 1 ? "fr" : "en";
}

/** Avoid silently treating clearly non-supported scripts/languages as English. */
export function isUnsupportedChatLanguage(text: string) {
  if (/[\u0400-\u052f\u2de0-\u2dff\ua640-\ua69f\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0900-\u097f]/u.test(text)) return true;
  const words = normalize(text).match(/[\p{L}]+/gu) ?? [];
  if (words.length < 4) return false;
  const otherLanguageMarkers = new Set([
    "hola", "gracias", "como", "cuenta", "retiro", "reglas", "precio", "cuanto", "quiero", "puedo",
    "hallo", "danke", "konto", "auszahlung", "regeln", "preis", "wie", "moechte", "bitte",
    "ciao", "grazie", "conto", "prelievo", "regole", "prezzo", "quanto", "vorrei",
  ]);
  return words.filter((word) => otherLanguageMarkers.has(word)).length >= 2;
}

export function languageName(language: ChatLanguage) {
  return language === "ar" ? "Arabic" : language === "fr" ? "French" : "English";
}
