import type { ProductDocument } from "@/lib/cms/schemas/product";
import {
  brokerAccountTypesHeading,
  brokerHowItWorksHeading,
  brokerRegistrationCta,
} from "@/lib/landing/broker";

/**
 * Shipped copy for `/trading`, lifted from the section
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
  title: "A clearer way to trade global markets.",
  lead: "Reliable market access, clear account conditions, professional MT5 technology and straightforward payment journeys.",
  actionHref: "/about#why",
  actionLabel: "The full argument",
};

export const tradingDefaults: ProductDocument = {
  meta: {
    title: "Live trading accounts",
    description:
      "Open a Standard, Pro or VIP live trading account, deposit your own balance and trade forex, metals, indices and crypto — no evaluation, no profit split.",
  },
  accountTypes: { ...brokerAccountTypesHeading },
  howItWorks: { ...brokerHowItWorksHeading },
  why: { ...whyHeading },
  cta: {
    title: brokerRegistrationCta.title,
    lead: brokerRegistrationCta.lead,
    primary: { ...brokerRegistrationCta.primary },
    secondary: { ...brokerRegistrationCta.secondary },
  },
};
