/** External portal signup — every Create / Open account CTA lands here. */
export const signupUrl =
  "https://portal.bbcorp.trade/auth/jwt/sign-up/b/72nzf8/prod/BPOM9S";

export const site = {
  name: "Connect Funded",
  shortName: "Connect Funded",
  tagline: "Trade live markets.",
  description:
    "Multi-asset live trading. Open a Standard, Pro or VIP account and trade forex, precious metals, commodities and indices from MetaTrader 5, cTrader or the Web Terminal.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-funded.vercel.app",
  email: "support@connectfunded.com",
  salesEmail: "sales@connectfunded.com",
  phone: "+1 (555) 018-2200",
  address: "Beirut, Lebanon",
  locales: ["EN", "AR", "FR"] as const,
  signupUrl,
  whatsapp: {
    label: "WhatsApp",
    href: "https://wa.me/15550182200",
  },
} as const;

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
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

export const primaryNav: NavGroup[] = [
  {
    label: "Trading",
    href: "/trading",
    columns: [
      {
        title: "Live trading",
        links: [
          {
            label: "Trading overview",
            href: "/trading",
            description: "Your capital, our execution stack",
          },
          {
            label: "Account Types",
            href: "/trading/accounts",
            description: "Standard, Pro and VIP",
          },
          {
            label: "How It Works",
            href: "/trading/how-it-works",
            description: "Register, verify, fund, trade",
          },
        ],
      },
      {
        title: "Markets & tools",
        links: [
          {
            label: "Products",
            href: "/products",
            description: "Every instrument and its live spread",
          },
          {
            label: "Platforms",
            href: "/platforms",
            description: "MetaTrader 5, cTrader, Web Terminal",
          },
        ],
      },
    ],
    featured: {
      title: "Open a live account",
      body: "Standard from $100, Pro from $1,000, VIP from $50,000 — no evaluation, no profit split.",
      href: signupUrl,
      cta: "Start registration",
    },
  },
  { label: "Payments", href: "/payments" },
  {
    label: "Markets",
    columns: [
      {
        title: "Live data",
        links: [
          {
            label: "Market Terminal",
            href: "/markets",
            description: "Real-time quotes across every asset class",
            badge: "Live",
          },
          {
            label: "Charts",
            href: "/markets#charts",
            description: "Full TradingView charting",
          },
          {
            label: "Economic Calendar",
            href: "/markets#calendar",
            description: "High-impact events, filtered by session",
          },
        ],
      },
      {
        title: "Analysis",
        links: [
          {
            label: "Technical Ratings",
            href: "/markets#ratings",
            description: "Multi-timeframe consensus signals",
          },
          {
            label: "Market Screener",
            href: "/markets#screener",
            description: "Scan movers across 1,000+ symbols",
          },
        ],
      },
    ],
  },
  {
    label: "Learn",
    columns: [
      {
        title: "Education",
        links: [
          {
            label: "Trading glossary",
            href: "/glossary",
            description: "Ask, bid, spread, margin, leverage and the rest, A–Z",
          },
        ],
      },
      {
        title: "Support",
        links: [
          {
            label: "Funding and payout FAQ",
            href: "/faq",
            description:
              "Deposits, withdrawals, limits, verification and tracking",
          },
          {
            label: "Contact",
            href: "/contact",
            description: "Talk to support, sales or partnerships",
          },
        ],
      },
    ],
  },
  { label: "About", href: "/about" },
];

/** In-page sections on the flagship homepage — kept in one place for nav, search and chat. */
export const homeSections = [
  {
    id: "trading",
    href: "/#trading",
    label: "Live trading",
    description:
      "Your capital, our execution stack — Standard, Pro and VIP",
  },
  {
    id: "about",
    href: "/#about",
    label: "About us",
    description:
      "Who we are, how the model works, and why the rules are published",
  },
  {
    id: "contact",
    href: "/#contact",
    label: "Contact us",
    description: "Support, sales, partnerships and the hiring desk",
  },
] as const;

export const footerNav = [
  {
    title: "Trading",
    links: [
      { label: "Trading overview", href: "/trading" },
      { label: "Live account types", href: "/trading/accounts" },
      { label: "How live trading works", href: "/trading/how-it-works" },
      { label: "Products", href: "/products" },
      { label: "Platforms", href: "/platforms" },
      { label: "Market Terminal", href: "/markets" },
    ],
  },
  {
    title: "Payments",
    links: [
      { label: "Payments", href: "/payments" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Mission & vision", href: "/about#mission" },
      { label: "Why Connect Funded", href: "/about#why" },
      { label: "Careers", href: "/about#careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Trading glossary", href: "/glossary" },
      { label: "Funding and payout FAQ", href: "/faq" },
      { label: "Client Portal", href: "/portal" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Risk Disclosure", href: "/legal/risk-disclosure" },
      { label: "AML & KYC Policy", href: "/legal/aml-kyc" },
      { label: "Refund Policy", href: "/legal/refunds" },
    ],
  },
] as const;

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

export const riskDisclosure =
  "Trading forex, precious metals, commodities and CFDs carries a significant risk of loss and is not suitable for every investor. Funded account programs evaluate performance on simulated or firm capital under the rules published in each program's terms. Past performance is not indicative of future results. Nothing on this site constitutes financial advice.";
