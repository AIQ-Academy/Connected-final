import { brokerAccountTiers } from "@/lib/landing/broker";
import { signupUrl } from "@/lib/site";

export const homeHero = {
  eyebrow: "Multi-asset trading · live markets",
  title: ["Six asset classes.", "One trading account."] as const,
  lead: "Forex, precious metals, energy, global indices, share CFDs and crypto — quoted on raw spreads and executed from MetaTrader 5, cTrader or the Web Terminal on a single login.",
  stats: [
    { value: "0%", label: "Commission" },
    { value: "6", label: "Asset classes" },
    { value: "24/5", label: "Market access" },
  ] as const,
  primary: { href: signupUrl, label: "Open an account" },
  secondary: { href: "/markets", label: "See live markets" },
  tertiary: { href: "/platforms", label: "Platforms" },
} as const;

export const homeTrading = {
  id: "trading",
  eyebrow: "Live trading",
  kicker: "Your capital",
  title: "Fund your own account. Keep every dollar you make.",
  lead: "Open a Standard, Pro or VIP account, deposit from $100 and trade forex, metals, energy, indices, share CFDs and crypto on raw spreads — withdrawals on your schedule.",
  points: [
    {
      label: "From $100",
      detail: "Standard minimum deposit, instant on card and crypto",
    },
    {
      label: "Pro from $1,000",
      detail: "Tighter spreads, priority execution and VPS hosting",
    },
    {
      label: "VIP from $50,000",
      detail: "Raw spreads, institutional liquidity and a personal trading advisor",
    },
    {
      label: "Your withdrawals",
      detail:
        "Request any time the markets are open — reviewed within 24 hours",
    },
  ],
  stats: [
    { value: "$100", label: "Minimum deposit" },
    { value: "$1,000", label: "Pro from" },
    { value: "$50K", label: "VIP from" },
    { value: "24/5", label: "Market access" },
  ] as const,
  primary: { href: "/trading", label: "Explore live trading" },
  secondary: { href: signupUrl, label: "Open live account" },
  tertiary: { href: "/trading/accounts", label: "Compare account types" },
  tiers: brokerAccountTiers,
} as const;

export const homeFunded = {
  id: "funded",
  eyebrow: "Funded evaluations",
  kicker: "Firm capital",
  title: "Pass a transparent challenge. Trade up to $200,000 of ours.",
  lead: "Two phases, a published rulebook and no time limit. Keep up to 90% of the profit, get the evaluation fee back with your first payout, and scale to $2,000,000 on consistent performance.",
  points: [
    {
      label: "Two-phase evaluation",
      detail: "8–10% then 4–5%, with a 5% daily and 10% overall drawdown",
    },
    {
      label: "Up to 90% split",
      detail: "80% to 90% by tier — it rises with scaling and never decreases",
    },
    {
      label: "Fee refunded",
      detail: "The evaluation fee returns with your first funded payout",
    },
    {
      label: "Scale to $2M",
      detail: "Hit 10% across two payout cycles and we double the allocation",
    },
  ],
  stats: [
    { value: "$10K–$200K", label: "Account sizes" },
    { value: "90%", label: "Top profit split" },
    { value: "24–48h", label: "Payout release" },
    { value: "$2M", label: "Scale ceiling" },
  ] as const,
  primary: { href: "/funded", label: "Explore funded trading" },
  secondary: { href: signupUrl, label: "Start evaluation" },
  tertiary: { href: "/accounts", label: "Compare all tiers" },
} as const;

/**
 * Homepage figures. Deliberately not `companyStats` from `@/lib/content`: that
 * list leads on evaluations issued, which is the story `/about` tells rather
 * than the multi-asset offering this page is built around.
 */
export const homeAboutStats = [
  { value: "6", label: "Asset classes" },
  { value: "3", label: "Trading platforms" },
  { value: "142", label: "Countries served" },
  { value: "4.7 / 5", label: "Average trader rating" },
] as const;

export const homeAbout = {
  id: "about",
  eyebrow: "About us",
  title: "A broker for traders who take their edge seriously.",
  lead: "Connect Funded was built around one question: what does a trading account look like if you assume the trader is competent and the operator is the variable? Publish every cost. Enforce it in software. Settle withdrawals on a calendar.",
  quote:
    "A trading account is a contract, not a favour. The only thing that makes it credible is that every cost is published before the trader deposits, and that none of them move afterwards.",
  mission: {
    eyebrow: "Mission",
    body: "To give traders reliable market access, clear account conditions, professional trading technology, and straightforward payment journeys supported by responsive service.",
  },
  vision: {
    eyebrow: "Vision",
    body: "To build a trusted, technology-led brokerage experience recognized for clarity, accessibility, and consistent client support.",
  },
  disclaimer: {
    title: "Important Risk Disclaimer",
    risk: "Forex, CFDs, and leveraged trading carry a high level of risk and may result in significant losses. Leverage can amplify gains and losses, and past performance is not indicative of future results.",
    advice:
      "Information provided by Connect Funded is for informational purposes only and should not be considered financial or investment advice. All accounts and services are subject to applicable rules and Terms & Conditions.",
    availability:
      "Our services may not be available in all jurisdictions. Users are responsible for complying with applicable local laws.",
  },
  stats: homeAboutStats,
  primary: { href: "/about", label: "Read our story" },
  secondary: { href: "/about#why", label: "Why traders choose us" },
} as const;

export const homeContact = {
  id: "contact",
  eyebrow: "Contact us",
  title: "Talk to the desk.",
  lead: "Support, account advice, partnerships and hiring all route separately. Pick the topic that matches and you reach the people who own that decision.",
  stats: [
    { term: "Support coverage", detail: "24 hours, 5 days a week" },
    { term: "First reply target", detail: "One business hour" },
    { term: "Languages", detail: "English, Arabic, French" },
  ] as const,
  primary: { href: "/contact", label: "Full contact page" },
} as const;
