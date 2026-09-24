import "server-only";

import { getContent } from "@/lib/cms/get-content";
import { CMS_KEYS, CMS_KEY_ROUTES } from "@/lib/cms/schemas";
import type { SearchResult } from "@/lib/search-index";

/**
 * Keeps discovery surfaces honest about CMS-driven copy.
 *
 * The static search index, the sitemap and the assistant's system prompt all
 * describe the same three pages. Once an editor can change those pages' words,
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
    `Live trading page (/trading): ${trading.meta.description}`,
  ].join("\n");
}

/** Route → CMS key, for surfaces that need to look one up from the other. */
export const cmsRouteKeys = Object.fromEntries(
  CMS_KEYS.map((key) => [CMS_KEY_ROUTES[key], key] as const),
);
