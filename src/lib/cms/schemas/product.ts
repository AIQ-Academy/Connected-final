import { z } from "zod";

import {
  ctaSchema,
  headingSchema,
  metaSchema,
  plainHeadingSchema,
} from "@/lib/cms/schemas/shared";

/**
 * `/funded` and `/trading` are built from the same section components with
 * different copy, so they share one schema and differ only in their defaults.
 * One schema also means one admin form renderer for both keys.
 */
export const productDocumentSchema = z.object({
  meta: metaSchema,
  accountTypes: headingSchema,
  howItWorks: headingSchema,
  why: headingSchema,
  testimonials: plainHeadingSchema,
  cta: ctaSchema,
});

export type ProductDocument = z.infer<typeof productDocumentSchema>;
