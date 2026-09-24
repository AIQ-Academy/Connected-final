import type { ProductDocument } from "@/lib/cms/schemas/product";
import {
  brokerAccountTypesHeading,
  brokerHowItWorksHeading,
  brokerRegistrationCta,
} from "@/lib/landing/broker";
import { signupUrl } from "@/lib/site";

/**
 * Shipped copy for `/funded` and `/trading`, lifted from the section
 * components and the broker landing constants so the CMS fallback renders the
 * page exactly as it does today.
 *
 * `{count}` in an action label is replaced with the number of live tiers by
 * the section that renders it — that keeps "Compare all 5 tiers" accurate
 * without an editor having to remember to update the number.
 */

/** Shared between both products: the same component renders both pages. */
const whyHeading = {
  eyebrow: "Why Connect Funded",
  lead: "These are the commitments we publish before you pay, not the ones we reach for after a dispute.",
  actionHref: "/about#why",
  actionLabel: "The full argument",
};

const fundedTestimonialsHeading = {
  eyebrow: "Funded traders",
  title: "Paid, on the day we said we would.",
  lead: "Every quote below comes from a trader on a live funded account, published with the tier they trade and the payout it produced.",
};

const tradingTestimonialsHeading = {
  eyebrow: "Live traders",
  title: "Paid, on the day we said we would.",
  lead: "Every quote below comes from a trader on a live account, published with the account they trade.",
};

const tradingWhyHeading = {
  eyebrow: "Why Connect Funded",
  title: "The account is yours. The infrastructure is ours.",
  lead: "Segregated funds, published costs and the same platforms on every tier — Standard, Pro and VIP.",
  actionHref: "/about#why",
  actionLabel: "The full argument",
};

export const fundedDefaults: ProductDocument = {
  meta: {
    title: "Funded evaluations",
    description:
      "Pass a transparent two-phase evaluation on forex, metals, commodities, indices and crypto. Trade up to $200,000 of Connect Funded capital and keep up to 90% of the profit.",
  },
  accountTypes: {
    eyebrow: "Account tiers",
    title: "Pick the capital. The rules never change.",
    lead: "Targets, drawdown limits and the refund policy are identical at every size. Only the allocation, the fee and your split move.",
    actionHref: "/accounts",
    actionLabel: "Compare all {count} tiers",
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Four stages between here and a funded account",
    lead: "An 8–10% Phase 1 target, 4–5% in Phase 2, a 5% daily and 10% overall drawdown ceiling throughout. Nothing is decided after the fact.",
    actionHref: "/how-it-works",
    actionLabel: "Read the full rulebook",
  },
  why: { ...whyHeading, title: "" },
  testimonials: { ...fundedTestimonialsHeading },
  cta: {
    title: "The capital is ready. The only variable is you.",
    lead: "Choose a tier between $10,000 and $200,000, clear the evaluation and keep 80% to 90% of everything you make.",
    primary: { href: signupUrl, label: "Create account" },
    secondary: { href: "/how-it-works", label: "Read the rulebook first" },
  },
};

export const tradingDefaults: ProductDocument = {
  meta: {
    title: "Live trading accounts",
    description:
      "Open a Standard, Pro or VIP live trading account, deposit your own balance and trade forex, metals, indices and crypto — no evaluation, no profit split.",
  },
  accountTypes: { ...brokerAccountTypesHeading },
  howItWorks: { ...brokerHowItWorksHeading },
  why: { ...tradingWhyHeading },
  testimonials: { ...tradingTestimonialsHeading },
  cta: {
    title: brokerRegistrationCta.title,
    lead: brokerRegistrationCta.lead,
    primary: { ...brokerRegistrationCta.primary },
    secondary: { ...brokerRegistrationCta.secondary },
  },
};
