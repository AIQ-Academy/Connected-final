import { instrumentSeed } from "@/db/seed-data";
import { fundingFaqs } from "@/lib/funding-faq";
import { footerNav, homeSections, primaryNav, signupUrl } from "@/lib/site";

export type SearchResultKind = "page" | "faq" | "instrument";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string;
};

const extraPages: SearchResult[] = [
  {
    id: "home",
    kind: "page",
    title: "Home",
    subtitle: "Live trading accounts",
    href: "/",
    keywords: "home homepage intro video trading about contact",
  },
  ...homeSections.map((section) => ({
    id: `home-${section.id}`,
    kind: "page" as const,
    title: section.label,
    subtitle: section.description,
    href: section.href,
    keywords: `${section.label} ${section.description} homepage ${section.id}`.toLowerCase(),
  })),
  {
    id: "trading",
    kind: "page",
    title: "Live trading",
    subtitle: "Broker-style accounts with your own capital",
    href: "/trading",
    keywords: "trading broker live account standard pro vip",
  },
  {
    id: "trading-accounts",
    kind: "page",
    title: "Live account types",
    subtitle: "Standard, Pro and VIP",
    href: "/trading/accounts",
    keywords: "trading accounts spreads deposit commission leverage",
  },
  {
    id: "trading-how-it-works",
    kind: "page",
    title: "How live trading works",
    subtitle: "Register, verify, fund, trade",
    href: "/trading/how-it-works",
    keywords: "trading how it works kyc deposit withdraw",
  },
  {
    id: "payments-first-payout",
    kind: "page",
    title: "Before the first payout",
    subtitle: "Checklist required before submitting a payout request",
    href: "/payments#first-payout",
    keywords:
      "payout readiness kyc verified identity documents first payout checklist funding security",
  },
  {
    id: "payments",
    kind: "page",
    title: "Payments",
    subtitle: "Payment rails and transaction limits",
    href: "/payments",
    keywords:
      "payments rails visa local bank transfer usdt tether whish money omt bob finance deposit withdrawal limits daily cap",
  },
  {
    id: "glossary",
    kind: "page",
    title: "Trading glossary",
    subtitle: "A–Z of trading terms",
    href: "/glossary",
    keywords:
      "glossary ask bid spread margin leverage lot pip swap stop loss take profit market order pending order cfd volatility trading terms",
  },
  {
    id: "register",
    kind: "page",
    title: "Create account",
    subtitle: "Registration wizard",
    href: signupUrl,
    keywords: "register signup account broker trading",
  },
  {
    id: "portal",
    kind: "page",
    title: "Client portal",
    subtitle: "Dashboard, payouts, KYC",
    href: "/portal",
    keywords: "login dashboard client portal payouts kyc",
  },
  {
    id: "legal-terms",
    kind: "page",
    title: "Terms and conditions",
    href: "/legal/terms",
    keywords: "legal terms rules contract",
  },
  {
    id: "legal-privacy",
    kind: "page",
    title: "Privacy policy",
    href: "/legal/privacy",
    keywords: "legal privacy data gdpr",
  },
  {
    id: "legal-risk",
    kind: "page",
    title: "Risk disclosure",
    href: "/legal/risk-disclosure",
    keywords: "legal risk cfd forex disclosure",
  },
  {
    id: "legal-aml",
    kind: "page",
    title: "AML and KYC policy",
    href: "/legal/aml-kyc",
    keywords: "legal aml kyc identity verification",
  },
  {
    id: "legal-refunds",
    kind: "page",
    title: "Refund policy",
    href: "/legal/refunds",
    keywords: "legal refund deposit withdrawal",
  },
];

function navToResults(): SearchResult[] {
  const results: SearchResult[] = [...extraPages];

  const pushUnique = (entry: SearchResult) => {
    if (results.some((r) => r.href === entry.href && r.kind === entry.kind)) {
      return;
    }
    results.push(entry);
  };

  for (const group of primaryNav) {
    if (group.href) {
      pushUnique({
        id: `nav-${group.label}`,
        kind: "page",
        title: group.label,
        href: group.href,
        keywords: group.label.toLowerCase(),
      });
    }

    for (const column of group.columns ?? []) {
      for (const link of column.links) {
        pushUnique({
          id: `nav-${link.href}`,
          kind: "page",
          title: link.label,
          subtitle: link.description,
          href: link.href,
          keywords: `${link.label} ${link.description ?? ""} ${column.title}`.toLowerCase(),
        });
      }
    }

    if (group.featured) {
      pushUnique({
        id: `featured-${group.featured.href}`,
        kind: "page",
        title: group.featured.title,
        subtitle: group.featured.body,
        href: group.featured.href,
        keywords: `${group.featured.title} ${group.featured.body}`.toLowerCase(),
      });
    }
  }

  for (const section of footerNav) {
    for (const link of section.links) {
      pushUnique({
        id: `footer-${link.href}`,
        kind: "page",
        title: link.label,
        subtitle: section.title,
        href: link.href,
        keywords: `${link.label} ${section.title}`.toLowerCase(),
      });
    }
  }

  return results;
}

function faqToResults(): SearchResult[] {
  return fundingFaqs.map((faq) => ({
    id: `faq-${faq.id}`,
    kind: "faq" as const,
    title: faq.question,
    subtitle: faq.category,
    href: `/faq#${faq.id}`,
    keywords: `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase(),
  }));
}

function instrumentsToResults(): SearchResult[] {
  return instrumentSeed.map((instrument) => ({
    id: `instrument-${instrument.symbol}`,
    kind: "instrument" as const,
    title: instrument.symbol,
    subtitle: instrument.displayName,
    href: `/markets#${instrument.symbol.replace(/\W/g, "-").toLowerCase()}`,
    keywords: `${instrument.symbol} ${instrument.displayName} ${instrument.assetClass} ${instrument.tvSymbol}`.toLowerCase(),
  }));
}

/** Static index used by the header command palette (client-side fuzzy match). */
export const searchIndex: SearchResult[] = [
  ...navToResults(),
  ...faqToResults(),
  ...instrumentsToResults(),
];

/** Simple subsequence fuzzy score — higher is better, 0 means no match. */
export function fuzzyScore(needle: string, haystack: string): number {
  const n = needle.trim().toLowerCase();
  const h = haystack.toLowerCase();
  if (!n) return 1;
  if (h.includes(n)) return 100 + (100 - h.indexOf(n));

  let score = 0;
  let hIndex = 0;
  for (const char of n) {
    const found = h.indexOf(char, hIndex);
    if (found === -1) return 0;
    score += 1 + (found === hIndex ? 2 : 0);
    hIndex = found + 1;
  }
  return score;
}

/**
 * Merge CMS-derived entries over the static index.
 *
 * An entry replaces the static one for the same href and kind so a page whose
 * copy an editor changed is findable by its current words, not the ones that
 * shipped. Everything else is left exactly as it was.
 */
export function mergeSearchEntries(
  base: SearchResult[],
  extra: SearchResult[],
): SearchResult[] {
  if (extra.length === 0) return base;

  const replaced = new Set(extra.map((item) => `${item.kind}:${item.href}`));
  return [
    ...extra,
    ...base.filter((item) => !replaced.has(`${item.kind}:${item.href}`)),
  ];
}

export function searchSite(
  query: string,
  limit = 12,
  extra: SearchResult[] = [],
): SearchResult[] {
  const index = mergeSearchEntries(searchIndex, extra);
  const needle = query.trim();
  if (!needle) {
    return index.filter((item) => item.kind === "page").slice(0, 8);
  }

  return index
    .map((item) => {
      const blob = `${item.title} ${item.subtitle ?? ""} ${item.keywords}`;
      const score = Math.max(
        fuzzyScore(needle, item.title),
        fuzzyScore(needle, blob) * 0.85,
      );
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
