import type { Stage } from "@/lib/content";
import type { HeroSlide } from "@/components/sections/hero/copy";
import { signupUrl } from "@/lib/site";

export type BrokerAccountTier = {
  code: string;
  name: string;
  minDeposit: number;
  /** Omitted when the published spec does not give a figure — never fabricate. */
  spreadFrom?: string;
  leverage?: string;
  commission?: string;
  isFeatured: boolean;
  features: string[];
};

/** Shared brand-blue treatments for account packages. */
export const brokerAccountSkins = {
  standard: {
    frame: "account-tier-frame-standard",
    plate: "account-tier-plate-standard",
    border: "account-tier-border-standard",
    title: "account-tier-title-standard",
    spread: "account-tier-spread-standard",
    detail: "account-tier-detail",
    check: "account-tier-check-standard",
  },
  pro: {
    frame: "account-tier-frame-pro",
    plate: "account-tier-plate-pro",
    border: "account-tier-border-pro",
    title: "account-tier-title-pro",
    spread: "account-tier-spread-pro",
    detail: "account-tier-detail",
    check: "account-tier-check-pro",
  },
  vip: {
    frame: "account-tier-frame-vip",
    plate: "account-tier-plate-vip",
    border: "account-tier-border-vip",
    title: "account-tier-title-vip",
    spread: "account-tier-spread-vip",
    detail: "account-tier-detail",
    check: "account-tier-check-vip",
  },
} as const;

export const brokerAccountTiers: BrokerAccountTier[] = [
  {
    code: "standard",
    name: "Standard",
    minDeposit: 100,
    spreadFrom: "Tight spread",
    leverage: "1:200",
    commission: "No commission",
    isFeatured: false,
    features: [
      "24/5 support for account and platform questions",
      "Free market analysis with session notes and key event coverage",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    minDeposit: 1_000,
    spreadFrom: "Tight spread",
    leverage: "1:200",
    commission: "No commission",
    isFeatured: true,
    features: [
      "Tight spreads across the full market list",
      "Priority execution during active market sessions",
      "Dedicated account manager for account and platform support",
      "Advanced analytics for planning and reviewing trades",
    ],
  },
  {
    code: "vip",
    name: "VIP",
    minDeposit: 50_000,
    spreadFrom: "Extra-tight spread",
    leverage: "1:200",
    isFeatured: false,
    features: [
      "Extra-tight spreads for high-volume trading",
      "Institutional liquidity routing",
      "Personal trading advisor for strategy reviews",
      "Invitations to exclusive market briefings and events",
      "Custom account solutions for your trading needs",
    ],
  },
];

/**
 * Cost facts the spec actually published. VIP has none — callers must not
 * fall back to another tier's pip, leverage or commission.
 */
export function brokerTierCostParts(tier: BrokerAccountTier): string[] {
  return [tier.spreadFrom, tier.leverage ? `Leverage up to ${tier.leverage}` : undefined, tier.commission].filter(
    (part): part is string => Boolean(part),
  );
}

/** Compact meta line for hero chips and the home trading band. */
export function brokerTierMetaLine(tier: BrokerAccountTier): string | null {
  const parts = brokerTierCostParts(tier);
  if (parts.length) return parts.join(" · ");
  return tier.features.slice(0, 2).join(" · ") || null;
}

export const brokerHeroSlides: readonly HeroSlide[] = [
  {
    id: "access",
    index: "01",
    eyebrow: "Traditional broker · direct market access",
    title: ["Your capital.", "Our infrastructure."],
    lead: "Open a live account, fund it with your own balance and trade forex, metals, indices and crypto — no evaluation, no profit split.",
    tone: "neutral",
    stats: [
      { value: "$100", label: "Standard from" },
      { value: "1:200", label: "Leverage up to" },
      { value: "24/5", label: "Market access" },
    ],
  },
  {
    id: "accounts",
    index: "02",
    eyebrow: "Three account types",
    title: ["Pick the account that fits.", "Trade the same markets."],
    lead: "Standard, Pro or VIP — every account routes through the same bridge, the same platforms and the same client portal.",
    tone: "brand",
  },
  {
    id: "funding",
    index: "03",
    eyebrow: "Fund and withdraw",
    title: ["Deposit in minutes.", "Withdraw on your schedule."],
    lead: "Cards, bank transfer, e-wallets and stablecoins. Your balance is yours — request a withdrawal any time the markets are open.",
    tone: "mint",
  },
] as const;

export const brokerHeroCta = {
  primary: { href: signupUrl, label: "Open live account" },
  secondary: { href: "/trading/accounts", label: "Compare account types" },
} as const;

export const brokerHowItWorksHeading = {
  eyebrow: "How it works",
  title: "Four steps from registration to your first live trade",
  lead: "No challenge phases. Verify once, fund the account and trade with your own capital on the platform you already use.",
  actionHref: "/trading/how-it-works",
  actionLabel: "Read the full path",
} as const;

export const brokerHowItWorksStages: Stage[] = [
  {
    index: "01",
    kicker: "Register",
    title: "Create your profile",
    body: "Sign up with email, choose Standard, Pro or VIP and pick MetaTrader 5 or the Web Terminal.",
    points: [
      "Live and demo from the same login",
      "No evaluation fee",
      "Portal access in under two minutes",
    ],
  },
  {
    index: "02",
    kicker: "Verify",
    title: "Complete KYC once",
    body: "Upload a government ID and proof of address inside the portal. Most profiles are cleared the same business day.",
    points: [
      "Photo ID plus proof of address",
      "Automated screening, human review",
      "Required before the first withdrawal",
    ],
  },
  {
    index: "03",
    kicker: "Fund",
    title: "Deposit your trading balance",
    body: "Deposit by card, Whish Money, OMT, BOB or crypto. Eligible card, wallet and crypto payments activate instantly.",
    points: [
      "From $100 on Standard",
      "Card, Whish Money, OMT, BOB and crypto",
      "Balance visible the moment it clears",
    ],
  },
  {
    index: "04",
    kicker: "Trade",
    title: "Execute on live markets",
    body: "Forex, metals, energy, indices and crypto from one login. Withdraw profits on the same rail you deposited with.",
    points: [
      "Benefits change by account type",
      "Leverage up to 1:200",
      "Withdrawals reviewed within 24 hours",
    ],
  },
];

export const brokerWhyHeadline = [
  "Segregated client funds",
  "Tier-1 liquidity routing",
  "Same platforms as funded traders",
  "No evaluation gate",
  "Transparent swap and commission",
] as const;

export const brokerRegistrationCta = {
  title: "Your account. Your balance. Our execution.",
  lead: "Open a Standard account from $100, upgrade when your volume warrants it, and trade the same instruments funded traders use — on capital you control.",
  primary: { href: signupUrl, label: "Open live account" },
  secondary: { href: "/contact", label: "Talk to an advisor" },
} as const;

export const brokerAccountTypesHeading = {
  eyebrow: "Account types",
  title: "Choose the account",
  lead: "Every account connects to the same bridge and platforms. Only the minimum deposit and the benefits that come with it change.",
  actionHref: "/trading/accounts",
  actionLabel: "Compare all accounts",
} as const;
