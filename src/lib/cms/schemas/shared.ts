import { z } from "zod";

/**
 * Primitives shared by every CMS document.
 *
 * Every string is bounded. A document is edited by hand in the admin, so the
 * limits exist to stop a paste accident from blowing out a layout rather than
 * to enforce editorial policy.
 */

const line = (max: number) => z.string().trim().min(1).max(max);

export const shortText = line(120);
export const titleText = line(200);
export const bodyText = line(800);

export const linkSchema = z.object({
  href: line(300),
  label: line(80),
});

/** A big number with a caption, e.g. `90%` / `Profit split`. */
export const statSchema = z.object({
  value: line(40),
  label: line(80),
});

/** A headline with a supporting sentence, used in feature lists. */
export const pointSchema = z.object({
  label: line(80),
  detail: line(300),
});

/** A definition-list row, e.g. `Support coverage` / `24 hours, 5 days a week`. */
export const termSchema = z.object({
  term: line(80),
  detail: line(300),
});

/** Standard section header: eyebrow, title, lead and an optional action link. */
export const headingSchema = z.object({
  eyebrow: shortText,
  title: titleText,
  lead: bodyText,
  actionHref: line(300),
  actionLabel: line(80),
});

/** Section header without an action button. */
export const plainHeadingSchema = z.object({
  eyebrow: shortText,
  title: titleText,
  lead: bodyText,
});

/** Page-level SEO. Kept separate from the rendered copy on purpose. */
export const metaSchema = z.object({
  title: line(120),
  description: line(320),
});

export const ctaSchema = z.object({
  title: titleText,
  lead: bodyText,
  primary: linkSchema,
  secondary: linkSchema,
});

export type Link = z.infer<typeof linkSchema>;
export type Stat = z.infer<typeof statSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Term = z.infer<typeof termSchema>;
export type Heading = z.infer<typeof headingSchema>;
export type PlainHeading = z.infer<typeof plainHeadingSchema>;
export type Meta = z.infer<typeof metaSchema>;
export type Cta = z.infer<typeof ctaSchema>;
