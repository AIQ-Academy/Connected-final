/**
 * Homepage hero copy, authored as a three-screen horizontal sequence:
 * the pitch (0% commission), the funding types, and the calculator.
 */

import { signupUrl } from "@/lib/site";

/** Shared calls to action, repeated on the opening and closing screens. */
export const heroCta = {
  primary: { href: signupUrl, label: "Create account" },
  secondary: { href: "/accounts", label: "Compare account tiers" },
} as const;

export type HeroStat = { value: string; label: string };

export type HeroSlide = {
  /** Stable key. */
  id: string;
  /** Ghost numeral painted behind the screen. */
  index: string;
  eyebrow: string;
  /** Two lines, animated independently. */
  title: readonly [string, string];
  lead: string;
  /** Accent wash tint per screen — keeps the three feeling distinct. */
  tone: "neutral" | "brand" | "mint";
  stats?: readonly HeroStat[];
};

export const heroSlides: readonly HeroSlide[] = [
  {
    id: "commission",
    index: "01",
    eyebrow: "Raw spreads · zero commission",
    title: ["0% commission.", "Trade the spread only."],
    lead: "No commission layered on top of the quote. You trade raw spreads across forex, metals, indices and crypto — the same execution on every funded account.",
    tone: "neutral",
    stats: [
      { value: "0%", label: "Commission fee" },
      { value: "Raw", label: "Spread model" },
      { value: "4", label: "Asset classes" },
    ],
  },
  {
    id: "funding",
    index: "02",
    eyebrow: "Three funding types",
    title: ["Three sizes.", "One clear rulebook."],
    lead: "Pick the capital that matches your risk. Targets, drawdown floors and the refund policy stay identical — only allocation, fee and your split move.",
    tone: "brand",
  },
  {
    id: "calculator",
    index: "03",
    eyebrow: "Challenge calculator",
    title: ["Size your account.", "See the real fee."],
    lead: "Slide the capital, read the evaluation fee and profit split live, then start with that exact configuration.",
    tone: "mint",
  },
] as const;
