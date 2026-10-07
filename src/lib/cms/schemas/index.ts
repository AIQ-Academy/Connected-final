import type { z } from "zod";

import { homeDocumentSchema } from "@/lib/cms/schemas/home";
import { productDocumentSchema } from "@/lib/cms/schemas/product";

export * from "@/lib/cms/schemas/shared";
export * from "@/lib/cms/schemas/home";
export * from "@/lib/cms/schemas/product";

/**
 * The document keys the CMS owns today. `trading` replaced the older `broker`
 * key so the document name matches the public route; `scripts/push-schema.ts`
 * renames any surviving row. The `funded` key was retired with the funding
 * product — rows for it are simply ignored.
 */
export const CMS_KEYS = ["home", "trading"] as const;

export type CmsKey = (typeof CMS_KEYS)[number];

export const cmsSchemas = {
  home: homeDocumentSchema,
  trading: productDocumentSchema,
} satisfies Record<CmsKey, z.ZodType>;

export type CmsDocumentFor<K extends CmsKey> = z.infer<(typeof cmsSchemas)[K]>;

export function isCmsKey(value: string): value is CmsKey {
  return (CMS_KEYS as readonly string[]).includes(value);
}

/** Public routes that must be revalidated when a document changes. */
export const CMS_KEY_ROUTES: Record<CmsKey, string> = {
  home: "/",
  trading: "/trading",
};

export const CMS_KEY_LABELS: Record<CmsKey, string> = {
  home: "Homepage",
  trading: "Trading",
};
