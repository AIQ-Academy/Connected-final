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

export const brokerAccountTiers: BrokerAccountTier[] = [
  {
    code: "standard",
    name: "Standard",
    minDeposit: 100,
    spreadFrom: "1.0 pip",
    leverage: "1:500",
    commission: "No commission",
    isFeatured: false,
    features: [
      "No minimum trade size",
      "All trading instruments",
      "24/5 support",
      "Free market analysis",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    minDeposit: 1_000,
    spreadFrom: "0.4 pip",
    leverage: "1:500",
    commission: "No commission",
    isFeatured: true,
    features: [
      "Tighter spreads",
      "Priority execution",
      "Dedicated account manager",
      "Advanced analytics",
      "VPS hosting",
    ],
  },
  {
    code: "vip",
    name: "VIP",
    minDeposit: 50_000,
    isFeatured: false,
    features: [
      "Raw spreads",
      "Institutional liquidity",
      "Personal trading advisor",
      "Exclusive events",
      "Custom solutions",
    ],
  },
];

/**
 * Cost facts the spec actually published. VIP has none — callers must not
 * fall back to another tier's pip, leverage or commission.
 */
export function brokerTierCostParts(tier: BrokerAccountTier): string[] {
  return [tier.spreadFrom, tier.leverage, tier.commission].filter(
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
      { value: "1:500", label: "Leverage up to" },
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
    body: "Sign up with email, choose Standard, Pro or VIP and pick MetaTrader 5, cTrader or the Web Terminal.",
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
    body: "Cards and crypto settle instantly; bank transfers typically land within one to two business days. The full amount credits your account.",
    points: [
      "From $100 on Standard",
      "Eight payment rails, no deposit fee",
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
      "Leverage up to 1:500 on Standard and Pro",
      "Withdrawals reviewed within 24 hours",
    ],
  },
];

export const brokerWhyHeadline = [
  "Segregated client funds",
  "Tier-1 liquidity routing",
  "Same MT5, cTrader and Web Terminal stack",
  "No evaluation gate",
  "Transparent swap and commission",
] as const;

export const brokerRegistrationCta = {
  title: "Your account. Your balance. Our execution.",
  lead: "Open a Standard account from $100, upgrade when your volume warrants it, and trade forex, metals, indices and crypto on capital you control.",
  primary: { href: signupUrl, label: "Open live account" },
  secondary: { href: "/contact", label: "Talk to an advisor" },
} as const;

export const brokerAccountTypesHeading = {
  eyebrow: "Account types",
  title: "Choose the account. The markets stay the same.",
  lead: "Every account connects to the same bridge and platforms. Only the minimum deposit and the benefits that come with it change.",
  actionHref: "/trading/accounts",
  actionLabel: "Compare all accounts",
} as const;
