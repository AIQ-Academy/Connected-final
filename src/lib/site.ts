import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { getTradingEdgeCopy } from "@/lib/i18n/trading-edge";

/** External portal signup — every Create / Open account CTA lands here. */
export const signupUrl =
  "https://portal.bbcorp.trade/auth/jwt/sign-up/b/72nzf8/prod/BPOM9S";

/** Identifies direct signup links and local routes that redirect to signup. */
export function isSignupDestination(href: unknown): boolean {
  return typeof href === "string" && (
    href === signupUrl ||
    href.startsWith(`${signupUrl}/`) ||
    href === "/register" ||
    href.startsWith("/register?")
  );
}

export const site = {
  name: "Connect Funded",
  shortName: "Connect Funded",
  tagline: "Trade global markets with MT5.",
  description:
    "Trade forex, indices, metals, energies, stocks and crypto with clear conditions, flexible payment methods and professional MetaTrader 5 access.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-funded.vercel.app",
  email: "support@connectfunded.com",
  salesEmail: "sales@connectfunded.com",
  phone: "+1 (555) 018-2200",
  address: "Beirut, Lebanon",
  locales: ["EN", "AR", "FR"] as const,
  signupUrl,
} as const;

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  external?: boolean;
};

export type NavGroup = {
  label: string;
  href?: string;
  /** Rendered as a mega-menu panel when present. */
  columns?: { title: string; links: NavLink[] }[];
  featured?: {
    title: string;
    body: string;
    href: string;
    cta: string;
  };
};

/**
 * Primary navigation, translated per locale. Every group is an axis of the
 * same question — *what* you trade, *where* you trade it, *on what terms*,
 * and *with what information* — so a trader can reach any surface in two
 * moves, in whichever language they're browsing in.
 */
export function getPrimaryNav(locale: Locale): NavGroup[] {
  const t = getDictionary(locale);
  const edge = getTradingEdgeCopy(locale);
  return [
    {
      label: t["nav.trade"],
      href: "/trade",
      columns: [
        {
          title: t["nav.trade.markets"],
          links: [
            { label: t["nav.trade.forex"], href: "/trade/forex", description: t["nav.trade.forexDesc"] },
            { label: t["nav.trade.metals"], href: "/trade/metals", description: t["nav.trade.metalsDesc"] },
            { label: t["nav.trade.indices"], href: "/trade/indices", description: t["nav.trade.indicesDesc"] },
            { label: t["nav.trade.energies"], href: "/trade/commodities", description: t["nav.trade.energiesDesc"] },
          ],
        },
        {
          title: t["nav.trade.moreMarkets"],
          links: [
            { label: t["nav.trade.crypto"], href: "/trade/crypto", description: t["nav.trade.cryptoDesc"] },
            { label: t["nav.trade.shares"], href: "/trade/stocks", description: t["nav.trade.sharesDesc"] },
            { label: t["nav.trade.allInstruments"], href: "/products", description: t["nav.trade.allInstrumentsDesc"] },
            { label: t["nav.trade.specs"], href: "/trading/conditions", description: t["nav.trade.specsDesc"] },
          ],
        },
      ],
      featured: {
        title: t["nav.trade.featuredTitle"],
        body: t["nav.trade.featuredBody"],
        href: signupUrl,
        cta: t["nav.trade.featuredCta"],
      },
    },
    {
      label: t["nav.platforms"],
      href: "/platforms",
      columns: [
        {
          title: t["nav.platforms.tradeAnywhere"],
          links: [
            { label: t["nav.platforms.mt5"], href: "/platforms#mt5", description: t["nav.platforms.mt5Desc"] },
            { label: t["nav.platforms.mt5Downloads"], href: "/platforms#mt5", description: t["nav.platforms.mt5DownloadsDesc"] },
          ],
        },
        {
          title: t["nav.platforms.accounts"],
          links: [
            { label: t["nav.platforms.accountTypes"], href: "/trading/accounts", description: t["nav.platforms.accountTypesDesc"] },
            { label: t["nav.platforms.howItWorks"], href: "/trading/how-it-works", description: t["nav.platforms.howItWorksDesc"] },
            { label: t["nav.platforms.payments"], href: "/payments", description: t["nav.platforms.paymentsDesc"] },
          ],
        },
      ],
      featured: {
        title: t["nav.platforms.featuredTitle"],
        body: t["nav.platforms.featuredBody"],
        href: "/platforms",
        cta: t["nav.platforms.featuredCta"],
      },
    },
    {
      label: t["nav.markets"],
      href: "/markets",
      columns: [
        {
          title: t["nav.markets.liveData"],
          links: [
            { label: t["nav.markets.terminal"], href: "/markets", description: t["nav.markets.terminalDesc"], badge: t["nav.markets.terminalBadge"] },
            { label: t["nav.markets.charts"], href: "/markets#charts", description: t["nav.markets.chartsDesc"] },
            { label: t["nav.markets.screener"], href: "/markets#quotes", description: t["nav.markets.screenerDesc"] },
            { label: t["nav.markets.ratings"], href: "/markets#ratings", description: t["nav.markets.ratingsDesc"] },
          ],
        },
        {
          title: t["nav.markets.analysis"],
          links: [
            { label: t["nav.markets.calendar"], href: "https://www.forexfactory.com/", description: t["nav.markets.calendarDesc"], external: true },
          ],
        },
      ],
    },
    {
      label: t["nav.tools"],
      href: "/tools#tools-hero",
      columns: [
        {
          title: t["nav.tools.calculate"],
          links: [
            { label: t["nav.tools.calculator"], href: "/tools/calculator", description: t["nav.tools.calculatorDesc"] },
            { label: t["nav.markets.calendar"], href: "https://www.forexfactory.com/", description: t["nav.tools.calendarDesc"], external: true },
          ],
        },
        {
          title: t["nav.tools.reference"],
          links: [
            { label: t["nav.trade.specs"], href: "/trading/conditions", description: t["nav.tools.specsDesc"] },
            { label: t["nav.trade.allInstruments"], href: "/products", description: t["nav.tools.allInstrumentsDesc"] },
          ],
        },
      ],
      featured: {
        title: t["nav.tools.featuredTitle"],
        body: t["nav.tools.featuredBody"],
        href: "/tools/calculator",
        cta: t["nav.tools.featuredCta"],
      },
    },
    {
      label: edge.brand,
      href: "/trading-edge",
      columns: [
        {
          title: edge.pages.strategies.head,
          links: edge.menuItems.slice(0, 4),
        },
        {
          title: edge.pages.performance.title,
          links: edge.menuItems.slice(4),
        },
      ],
      featured: {
        title: edge.hubTitle,
        body: edge.hubLead,
        href: "/trading-edge",
        cta: edge.open,
      },
    },
    {
      label: t["nav.learn"],
      href: "/education",
      columns: [
        {
          title: t["nav.learn.education"],
          links: [
            { label: t["nav.learn.academy"], href: "/education", description: t["nav.learn.academyDesc"] },
            { label: t["nav.learn.glossary"], href: "/education#glossary", description: t["nav.learn.glossaryDesc"] },
          ],
        },
        {
          title: t["nav.learn.support"],
          links: [
            { label: t["nav.learn.faq"], href: "/faq", description: t["nav.learn.faqDesc"] },
            { label: t["nav.learn.contact"], href: "/contact", description: t["nav.learn.contactDesc"] },
          ],
        },
      ],
    },
    { label: t["nav.about"], href: "/about" },
  ];
}

/** @deprecated Use {@link getPrimaryNav} so labels follow the visitor's locale. */
export const primaryNav = getPrimaryNav("en");

/** In-page sections on the homepage — kept in one place for nav, search and chat. */
export function getHomeSections(locale: Locale) {
  const t = getDictionary(locale);
  return [
    { id: "markets", href: "/#markets", label: t["homeNav.markets"], description: t["homeNav.marketsDesc"] },
    { id: "conditions", href: "/#conditions", label: t["homeNav.conditions"], description: t["homeNav.conditionsDesc"] },
    { id: "platforms", href: "/#platforms", label: t["homeNav.platforms"], description: t["homeNav.platformsDesc"] },
    { id: "tools", href: "/#tools", label: t["homeNav.tools"], description: t["homeNav.toolsDesc"] },
    { id: "about", href: "/#about", label: t["homeNav.about"], description: t["homeNav.aboutDesc"] },
    { id: "contact", href: "/#contact", label: t["homeNav.contact"], description: t["homeNav.contactDesc"] },
  ] as const;
}

/** @deprecated Use {@link getHomeSections} so labels follow the visitor's locale. */
export const homeSections = getHomeSections("en");

export type FooterColumnKey = "markets" | "trading" | "tools" | "company" | "legal";

export function getFooterNav(locale: Locale): { key: FooterColumnKey; title: string; links: NavLink[] }[] {
  const t = getDictionary(locale);
  return [
    {
      key: "markets",
      title: t["footer.markets"],
      links: [
        { label: t["nav.trade.forex"], href: "/trade/forex" },
        { label: t["nav.trade.metals"], href: "/trade/metals" },
        { label: t["nav.trade.indices"], href: "/trade/indices" },
        { label: t["nav.trade.energies"], href: "/trade/commodities" },
        { label: t["nav.trade.crypto"], href: "/trade/crypto" },
        { label: t["nav.trade.shares"], href: "/trade/stocks" },
        { label: t["nav.trade.allInstruments"], href: "/products" },
      ],
    },
    {
      key: "trading",
      title: t["footer.trading"],
      links: [
        { label: t["nav.platforms.accountTypes"], href: "/trading/accounts" },
        { label: t["nav.platforms.howItWorks"], href: "/trading/how-it-works" },
        { label: t["nav.trade.specs"], href: "/trading/conditions" },
        { label: t["nav.platforms"], href: "/platforms" },
        { label: t["nav.platforms.payments"], href: "/payments" },
        { label: t["nav.markets.terminal"], href: "/markets" },
      ],
    },
    {
      key: "tools",
      title: t["footer.tools"],
      links: [
        { label: t["nav.tools.calculator"], href: "/tools/calculator" },
        { label: t["nav.markets.calendar"], href: "/tools/economic-calendar" },
        { label: t["nav.learn.academy"], href: "/education" },
        { label: t["nav.learn.glossary"], href: "/education#glossary" },
        { label: t["nav.learn.faq"], href: "/faq" },
      ],
    },
    {
      key: "company",
      title: t["footer.company"],
      links: [
        { label: t["footer.home"], href: "/" },
        { label: t["footer.aboutUs"], href: "/about" },
        { label: t["footer.whyTradeWithUs"], href: "/about#why" },
        { label: t["footer.careers"], href: "/about#careers" },
        { label: t["footer.contact"], href: "/contact" },
      ],
    },
    {
      key: "legal",
      title: t["footer.legal"],
      links: [
        { label: t["footer.terms"], href: "/legal/terms" },
        { label: t["footer.privacy"], href: "/legal/privacy" },
        { label: t["footer.riskDisclosure"], href: "/legal/risk-disclosure" },
        { label: t["footer.amlKyc"], href: "/legal/aml-kyc" },
        { label: t["footer.refunds"], href: "/legal/refunds" },
      ],
    },
  ] as const;
}

/** @deprecated Use {@link getFooterNav} so labels follow the visitor's locale. */
export const footerNav = getFooterNav("en");

export const socials = [
  { label: "X", href: "https://x.com", handle: "@connectfunded" },
  {
    label: "Instagram",
    href: "https://instagram.com",
    handle: "@connectfunded",
  },
  { label: "YouTube", href: "https://youtube.com", handle: "Connect Funded" },
  {
    label: "Telegram",
    href: "https://telegram.org",
    handle: "t.me/connectfunded",
  },
  { label: "Discord", href: "https://discord.com", handle: "Connect Funded" },
  { label: "LinkedIn", href: "https://linkedin.com", handle: "Connect Funded" },
] as const;

export function getRiskDisclosure(locale: Locale) {
  return getDictionary(locale)["footer.riskWarning"];
}

/** @deprecated Use {@link getRiskDisclosure} so the text follows the visitor's locale. */
export const riskDisclosure = getDictionary("en")["footer.riskWarning"];
