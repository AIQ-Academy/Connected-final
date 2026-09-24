import { z } from "zod";

import {
  bodyText,
  linkSchema,
  metaSchema,
  pointSchema,
  shortText,
  statSchema,
  termSchema,
  titleText,
} from "@/lib/cms/schemas/shared";

/**
 * The homepage document. Mirrors the section structure of `/`: an intro hero,
 * the two product bands (live trading and funded), then about and contact.
 *
 * Anything that is *data* rather than copy — account tiers, instrument lists,
 * testimonials — stays in the database tables it already lives in. This
 * document only ever holds editorial text and the links around it.
 */

export const homeHeroSchema = z.object({
  eyebrow: shortText,
  /** Rendered one line per entry so the headline can break deliberately. */
  title: z.array(titleText).min(1).max(4),
  lead: bodyText,
  stats: z.array(statSchema).max(6),
  primary: linkSchema,
  secondary: linkSchema,
  tertiary: linkSchema,
});

/** The two product bands share a shape; only their copy differs. */
export const homeProductSchema = z.object({
  eyebrow: shortText,
  kicker: shortText,
  title: titleText,
  lead: bodyText,
  points: z.array(pointSchema).max(8),
  stats: z.array(statSchema).max(8),
  primary: linkSchema,
  secondary: linkSchema,
  tertiary: linkSchema,
});

const statementSchema = z.object({
  eyebrow: shortText,
  body: bodyText,
});

export const homeAboutSchema = z.object({
  eyebrow: shortText,
  title: titleText,
  lead: bodyText,
  quote: bodyText,
  mission: statementSchema,
  vision: statementSchema,
  disclaimer: z.object({
    title: shortText,
    risk: bodyText,
    advice: bodyText,
    availability: bodyText,
  }),
  stats: z.array(statSchema).max(8),
  primary: linkSchema,
  secondary: linkSchema,
});

export const homeContactSchema = z.object({
  eyebrow: shortText,
  title: titleText,
  lead: bodyText,
  stats: z.array(termSchema).max(6),
  primary: linkSchema,
});

export const homeDocumentSchema = z.object({
  meta: metaSchema,
  hero: homeHeroSchema,
  trading: homeProductSchema,
  funded: homeProductSchema,
  about: homeAboutSchema,
  contact: homeContactSchema,
});

export type HomeDocument = z.infer<typeof homeDocumentSchema>;
export type HomeHeroContent = z.infer<typeof homeHeroSchema>;
export type HomeProductContent = z.infer<typeof homeProductSchema>;
export type HomeAboutContent = z.infer<typeof homeAboutSchema>;
export type HomeContactContent = z.infer<typeof homeContactSchema>;
