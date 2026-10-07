import { createHash } from "node:crypto";

export type IndexedSource = {
  id: string;
  title: string;
  content: string;
  language: "en" | "fr" | "ar";
  sourceUrl: string;
  section?: string;
  sourceType: "website" | "cms" | "faq" | "market" | "news";
};

/** Safe tokenizer for generated or hand-edited localization data. */
export function knowledgeTokens(text: unknown): string[] {
  if (typeof text !== "string" || text.length === 0) return [];
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function contentHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Splits on page structure first, then sentence boundaries, keeping useful context. */
export function chunkKnowledgeContent(content: string, maxChars = 900, overlapChars = 120) {
  const normalized = content.replace(/\r/g, "").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/u).flatMap((paragraph) => {
    if (paragraph.length <= maxChars) return [paragraph];
    const sentences = paragraph.split(/(?<=[.!?؟。])\s+/u);
    const result: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if (sentence.length > maxChars) {
        if (current) { result.push(current); current = ""; }
        let segment = "";
        for (const word of sentence.split(/\s+/u)) {
          if (segment && segment.length + word.length + 1 > maxChars) {
            result.push(segment);
            const tail = segment.slice(-overlapChars);
            segment = tail ? `${tail} ${word}` : word;
          } else segment = segment ? `${segment} ${word}` : word;
        }
        if (segment) current = segment;
        continue;
      }
      if (current && current.length + sentence.length + 1 > maxChars) {
        result.push(current);
        const tail = current.slice(-overlapChars);
        current = tail ? `${tail} ${sentence}` : sentence;
      } else current = current ? `${current} ${sentence}` : sentence;
    }
    if (current) result.push(current);
    return result;
  });
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Cosine similarity for optional cross-language embedding retrieval. */
export function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0; let aa = 0; let bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}
