import "server-only";

import { getCmsDocument } from "@/db/queries";
import { getCmsDefaults } from "@/lib/cms/defaults";
import { deepMerge } from "@/lib/cms/deep-merge";
import { cmsSchemas, type CmsDocumentFor, type CmsKey } from "@/lib/cms/schemas";
import { signupUrl } from "@/lib/site";

/**
 * Typed read for a CMS document.
 *
 * The contract is that this never throws and never returns a partial object:
 * a missing row, an unreachable database or a payload that no longer matches
 * the schema all resolve to the shipped defaults. A page wired to the CMS is
 * therefore never less reliable than the hardcoded version it replaced.
 */
export async function getContent<K extends CmsKey>(
  key: K,
): Promise<CmsDocumentFor<K>> {
  const defaults = getCmsDefaults(key);

  let payload: unknown;
  try {
    payload = await getCmsDocument(key);
  } catch (error) {
    console.warn(`[cms] read failed for "${key}", using defaults`, error);
    return defaults;
  }

  if (payload === null || payload === undefined) return defaults;

  return mergeContent(key, payload);
}

/**
 * Pure half of `getContent`, exported so the admin preview can render an
 * unsaved draft through exactly the same validation path as production.
 */
export function mergeContent<K extends CmsKey>(
  key: K,
  payload: unknown,
): CmsDocumentFor<K> {
  const defaults = getCmsDefaults(key);

  try {
    const merged = deepMerge(defaults, payload);
    const parsed = cmsSchemas[key].safeParse(merged);

    if (!parsed.success) {
      console.warn(
        `[cms] document "${key}" failed validation, using defaults`,
        parsed.error.issues.slice(0, 5),
      );
      return defaults;
    }

    return rewriteRegisterHrefs(parsed.data) as CmsDocumentFor<K>;
  } catch (error) {
    console.warn(`[cms] merge failed for "${key}", using defaults`, error);
    return defaults;
  }
}

/** Map leftover internal /register CTAs to the live portal signup URL. */
function rewriteRegisterHrefs<T>(value: T): T {
  if (typeof value === "string") {
    if (value === "/register" || value.startsWith("/register?")) {
      return signupUrl as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteRegisterHrefs(item)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      next[key] = rewriteRegisterHrefs(nested);
    }
    return next as T;
  }
  return value;
}
