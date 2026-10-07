import { brokerAccountTiers } from "@/lib/landing/broker";
import { companyStats } from "@/lib/content";
import { signupUrl } from "@/lib/site";

export const homeHero = {
  eyebrow: "Multi-asset trading · built for the next move",
  title: ["Trade every market", "from one sharper desk."] as const,
  lead: "Trade global markets with clear conditions, flexible payment methods, and professional MT5 access.",
  stats: [
    { value: "0.0", label: "Pip spreads from" },
    { value: "0%", label: "Commission" },
    { value: "18ms", label: "Median execution" },
  ] as const,
  primary: { href: signupUrl, label: "Start trading" },
  secondary: { href: "/#markets", label: "Explore markets" },
  tertiary: { href: "/tools/calculator", label: "Position calculator" },
} as const;

export const homeTrading = {
  id: "trading",
  eyebrow: "Live trading",
  kicker: "Your capital",
  title: "Standard, Pro or VIP. Keep every dollar you make.",
  lead: "Open a Standard, Pro or VIP account, deposit from $100 and trade all asset classes on one balance — no profit split, no lock-up, withdrawals on your schedule.",
  points: [
    {
      label: "From $100",
      detail: "Standard minimum deposit, instant on card and crypto",
    },
    {
      label: "Pro from $1,000",
      detail: "Tight spread and priority execution",
    },
    {
      label: "VIP from $50,000",
      detail: "Super-tight spreads, institutional liquidity and a personal trading advisor",
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

export const homeAbout = {
  id: "about",
  eyebrow: "About us",
  title: "A broker built for traders who read the spec sheet.",
  lead: "We were built around one question: what does a broker look like if you assume the trader is competent and the operator is the variable? Publish every number. Measure execution at the engine. Never widen a spread by policy.",
  quote:
    "A trading account is a contract, not a favour. The only thing that makes it credible is that every term is published before the trader deposits, and that none of them move afterwards.",
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
      "Information provided on this site is for informational purposes only and should not be considered financial or investment advice. All accounts are subject to the applicable Terms & Conditions and to the specifications published on the spec sheet.",
    availability:
      "Our services may not be available in all jurisdictions. Users are responsible for complying with applicable local laws.",
  },
  stats: companyStats,
  primary: { href: "/about", label: "Read our story" },
  secondary: { href: "/about#why", label: "Why traders choose us" },
} as const;

export const homeContact = {
  id: "contact",
  eyebrow: "Contact us",
  title: "Talk to the desk.",
  lead: "Support, account opening, partnerships and hiring all route separately. Pick the topic that matches and you reach the people who own that decision.",
  stats: [
    { term: "Support coverage", detail: "24 hours, 5 days a week" },
    { term: "First reply target", detail: "One business hour" },
    { term: "Languages", detail: "English, Arabic, French" },
  ] as const,
  primary: { href: "/contact", label: "Full contact page" },
} as const;
