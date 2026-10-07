import "server-only";

import { getContent } from "@/lib/cms/get-content";
import { CMS_KEYS, CMS_KEY_ROUTES } from "@/lib/cms/schemas";
import type { SearchResult } from "@/lib/search-index";
import type { KnowledgeDocument } from "@/lib/chat/knowledge-retrieval";
import { getAllPublishedNews, getFaqs, getInstruments, getNews } from "@/db/queries";

/**
 * Keeps discovery surfaces honest about CMS-driven copy.
 *
 * The static search index, the sitemap and the assistant's system prompt all
 * describe the same CMS-driven pages. Once an editor can change those pages' words,
 * every one of those surfaces has to read the same document or the site starts
 * contradicting itself — a visitor searching for a headline that only exists
 * in the CMS should still find the page.
 */

/** Search entries for the CMS-driven pages, using their live copy. */
export async function cmsSearchEntries(): Promise<SearchResult[]> {
  const [home, trading] = await Promise.all([
    getContent("home"),
    getContent("trading"),
  ]);

  const keywords = (...parts: string[]) =>
    parts.join(" ").toLowerCase().replace(/\s+/g, " ").trim();

  return [
    {
      id: "cms-home",
      kind: "page",
      title: home.meta.title,
      subtitle: home.hero.lead,
      href: CMS_KEY_ROUTES.home,
      keywords: keywords(
        home.hero.title.join(" "),
        home.hero.eyebrow,
        home.trading.title,
        home.about.title,
        home.about.mission.body,
        home.about.vision.body,
        home.contact.title,
        home.meta.description,
      ),
    },
    {
      id: "cms-trading",
      kind: "page",
      title: trading.meta.title,
      subtitle: trading.accountTypes.title,
      href: CMS_KEY_ROUTES.trading,
      keywords: keywords(
        trading.meta.description,
        trading.accountTypes.lead,
        trading.howItWorks.title,
        trading.why.title,
        trading.cta.title,
      ),
    },
  ];
}

/**
 * A compact description of the CMS-driven pages for the assistant's prompt, so
 * it never pitches the site with copy an editor has since replaced.
 */
export async function cmsKnowledgeSummary(): Promise<string> {
  const [home, trading] = await Promise.all([
    getContent("home"),
    getContent("trading"),
  ]);

  return [
    `Homepage (/): "${home.hero.title.join(" ")}" — ${home.hero.lead}`,
    `Live trading band (/#trading): ${home.trading.title}`,
    `Trading page (/trading): ${trading.meta.description}`,
  ].join("\n");
}

/** Current editor-managed copy, indexed on each request so edits are immediate. */
export async function cmsKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const [home, trading, faqs, instruments, news] = await Promise.all([
    getContent("home"), getContent("trading"), getFaqs(), getInstruments(), getAllPublishedNews(),
  ]);
  const homeContent = structuredCmsText("Home", home);
  const tradingContent = structuredCmsText("Live trading", trading);
  const cmsDocuments: KnowledgeDocument[] = [
    { id: "cms-home-live", category: "page", title: home.meta.title, keywords: { en: ["home", "homepage", "hero"], fr: ["accueil", "page d’accueil"], ar: ["الرئيسية", "الصفحة الرئيسية"] }, content: homeContent, contentByLocale: { en: homeContent }, summary: { en: home.hero.lead }, sourceRoutes: ["/"], sourceFiles: ["CMS:home"], parentPage: null },
    { id: "cms-trading-live", category: "page", title: trading.meta.title, keywords: { en: ["live trading", "broker account"], fr: ["trading", "compte de courtage"], ar: ["التداول", "حساب الوساطة"] }, content: tradingContent, contentByLocale: { en: tradingContent }, summary: { en: trading.meta.description }, sourceRoutes: ["/trading"], sourceFiles: ["CMS:trading"], parentPage: "/", sections: [trading.accountTypes.title, trading.howItWorks.title, trading.why.title] },
  ];
  const faqDocuments: KnowledgeDocument[] = faqs.map((faq) => ({
    id: `faq:${faq.id}`,
    category: `faq ${faq.category} ${faq.audience} audience`,
    title: faq.question,
    keywords: { en: [faq.category, faq.audience], fr: [faq.category], ar: [faq.category] },
    content: `Question: ${faq.question}\nAnswer: ${faq.answer}\nAudience: ${faq.audience}`,
    contentByLocale: { en: `Question: ${faq.question}\nAnswer: ${faq.answer}\nAudience: ${faq.audience}` },
    summary: { en: faq.answer },
    sourceRoutes: ["/faq"],
    sourceFiles: ["Database:published_faqs"],
    parentPage: "/faq",
    sections: [faq.category],
  }));
  const instrumentLabels: Record<string, { fr: string; ar: string }> = {
    forex: { fr: "devises forex", ar: "عملات فوركس" },
    metals: { fr: "métaux", ar: "المعادن" },
    commodities: { fr: "matières premières", ar: "السلع" },
    indices: { fr: "indices", ar: "المؤشرات" },
    crypto: { fr: "cryptomonnaies", ar: "العملات الرقمية" },
    stocks: { fr: "actions", ar: "الأسهم" },
  };
  const instrumentDocuments: KnowledgeDocument[] = instruments.filter((instrument) => instrument.isActive).map((instrument) => ({
    id: `instrument:${instrument.symbol}`,
    category: `market ${instrument.assetClass}`,
    title: `${instrument.displayName} (${instrument.symbol})`,
    keywords: { en: [instrument.assetClass, "instrument", "market"], fr: [instrumentLabels[instrument.assetClass]?.fr ?? instrument.assetClass, "instrument", "marché"], ar: [instrumentLabels[instrument.assetClass]?.ar ?? instrument.assetClass, "أداة", "سوق"] },
    content: `Instrument: ${instrument.displayName}. Symbol: ${instrument.symbol}. Asset class: ${instrument.assetClass}. Published maximum leverage: ${instrument.maxLeverage}. Published trading hours: ${instrument.tradingHours}. Stored base spread value: ${instrument.baseSpread}; source does not specify the unit.`,
    contentByLocale: {
      en: `Instrument: ${instrument.displayName}. Symbol: ${instrument.symbol}. Asset class: ${instrument.assetClass}. Published maximum leverage: ${instrument.maxLeverage}. Published trading hours: ${instrument.tradingHours}. Stored base spread value: ${instrument.baseSpread}; source does not specify the unit.`,
      fr: `Instrument : ${instrument.displayName}. Symbole : ${instrument.symbol}. Classe d’actif : ${instrumentLabels[instrument.assetClass]?.fr ?? instrument.assetClass}. Levier maximum publié : ${instrument.maxLeverage}. Horaires publiés : ${instrument.tradingHours}. Valeur de spread de base enregistrée : ${instrument.baseSpread} ; l’unité n’est pas précisée dans la source.`,
      ar: `الأداة: ${instrument.displayName}. الرمز: ${instrument.symbol}. فئة الأصل: ${instrumentLabels[instrument.assetClass]?.ar ?? instrument.assetClass}. أقصى رافعة منشورة: ${instrument.maxLeverage}. ساعات التداول المنشورة: ${instrument.tradingHours}. قيمة السبريد الأساسي المسجلة: ${instrument.baseSpread}؛ المصدر لا يحدد الوحدة.`,
    },
    summary: { en: `${instrument.displayName} (${instrument.symbol}) is a ${instrument.assetClass} instrument. Published leverage ${instrument.maxLeverage}; trading hours ${instrument.tradingHours}.`, fr: `${instrument.displayName} (${instrument.symbol}) est un instrument ${instrumentLabels[instrument.assetClass]?.fr ?? instrument.assetClass}. Levier publié : ${instrument.maxLeverage} ; horaires : ${instrument.tradingHours}.`, ar: `${instrument.displayName} (${instrument.symbol}) أداة ضمن ${instrumentLabels[instrument.assetClass]?.ar ?? instrument.assetClass}. الرافعة المنشورة ${instrument.maxLeverage}؛ ساعات التداول ${instrument.tradingHours}.` },
    sourceRoutes: ["/trade/:asset"],
    sourceFiles: ["Database:active_market_instruments"],
    parentPage: "/trade",
    sections: [instrument.assetClass, instrument.displayName],
  }));
  const newsDocuments: KnowledgeDocument[] = news.filter((article) => article.publishedAt && (article.excerpt || article.body)).map((article) => ({
    id: `news:${article.slug}`,
    category: `news ${article.category}`,
    title: article.title,
    keywords: { en: [article.category, "news", "article"], fr: [article.category, "actualités", "article"], ar: [article.category, "أخبار", "مقال"] },
    content: `${article.title}\n${article.excerpt}\n${article.body ?? ""}`,
    contentByLocale: { en: `${article.title}\n${article.excerpt}\n${article.body ?? ""}` },
    summary: { en: article.excerpt },
    sourceRoutes: [`/news/${article.slug}`],
    sourceFiles: ["Database:published_news"],
    parentPage: "/news",
    sections: [article.category],
  }));
  return [...cmsDocuments, ...faqDocuments, ...instrumentDocuments, ...newsDocuments];
}

function structuredCmsText(label: string, value: unknown) {
  const lines: string[] = [];
  const ignored = new Set(["href", "src", "url", "image", "ogimage", "mediaid", "slug", "id", "tone", "variant", "class", "classname", "sortorder"]);
  const visit = (current: unknown, path: string[]) => {
    const key = path.at(-1)?.toLowerCase() ?? "";
    if (ignored.has(key)) return;
    if (typeof current === "string") {
      if (path.length && current.trim()) lines.push(`${path.join(" / ")}: ${current.trim()}`);
      return;
    }
    if (typeof current === "number") {
      if (path.length) lines.push(`${path.join(" / ")}: ${current}`);
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, [...path, `item ${index + 1}`]));
      return;
    }
    if (current && typeof current === "object") {
      for (const [childKey, nested] of Object.entries(current)) visit(nested, [...path, childKey]);
    }
  };
  visit(value, [label]);
  return lines.join("\n");
}

/** Route → CMS key, for surfaces that need to look one up from the other. */
export const cmsRouteKeys = Object.fromEntries(
  CMS_KEYS.map((key) => [CMS_KEY_ROUTES[key], key] as const),
);
