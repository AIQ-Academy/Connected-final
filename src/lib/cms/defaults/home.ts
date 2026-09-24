import type { HomeDocument } from "@/lib/cms/schemas/home";
import {
  homeAbout,
  homeAboutStats,
  homeContact,
  homeFunded,
  homeHero,
  homeTrading,
} from "@/lib/landing/home";

/**
 * Shipped copy for `/`, lifted verbatim from `src/lib/landing/home.ts`.
 *
 * This is the fallback the page renders when the database is unreachable or a
 * saved document fails validation, and the payload the seed script writes on a
 * fresh install. The landing constants stay the single source of truth for the
 * text itself so nothing drifts between the two.
 */
export const homeDefaults: HomeDocument = {
  meta: {
    title: "Trade with Connect Funded",
    description:
      "Forex, metals, energy, indices, share CFDs and crypto on raw spreads — traded from MetaTrader 5, cTrader or the Web Terminal on one account.",
  },
  hero: {
    eyebrow: homeHero.eyebrow,
    title: [...homeHero.title],
    lead: homeHero.lead,
    stats: homeHero.stats.map((stat) => ({ ...stat })),
    primary: { ...homeHero.primary },
    secondary: { ...homeHero.secondary },
    tertiary: { ...homeHero.tertiary },
  },
  trading: {
    eyebrow: homeTrading.eyebrow,
    kicker: homeTrading.kicker,
    title: homeTrading.title,
    lead: homeTrading.lead,
    points: homeTrading.points.map((point) => ({ ...point })),
    stats: homeTrading.stats.map((stat) => ({ ...stat })),
    primary: { ...homeTrading.primary },
    secondary: { ...homeTrading.secondary },
    tertiary: { ...homeTrading.tertiary },
  },
  funded: {
    eyebrow: homeFunded.eyebrow,
    kicker: homeFunded.kicker,
    title: homeFunded.title,
    lead: homeFunded.lead,
    points: homeFunded.points.map((point) => ({ ...point })),
    stats: homeFunded.stats.map((stat) => ({ ...stat })),
    primary: { ...homeFunded.primary },
    secondary: { ...homeFunded.secondary },
    tertiary: { ...homeFunded.tertiary },
  },
  about: {
    eyebrow: homeAbout.eyebrow,
    title: homeAbout.title,
    lead: homeAbout.lead,
    quote: homeAbout.quote,
    mission: { ...homeAbout.mission },
    vision: { ...homeAbout.vision },
    disclaimer: { ...homeAbout.disclaimer },
    stats: homeAboutStats.map((stat) => ({ ...stat })),
    primary: { ...homeAbout.primary },
    secondary: { ...homeAbout.secondary },
  },
  contact: {
    eyebrow: homeContact.eyebrow,
    title: homeContact.title,
    lead: homeContact.lead,
    stats: homeContact.stats.map((stat) => ({ ...stat })),
    primary: { ...homeContact.primary },
  },
};
