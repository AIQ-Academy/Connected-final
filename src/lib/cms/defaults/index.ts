import { homeDefaults } from "@/lib/cms/defaults/home";
import { fundedDefaults, tradingDefaults } from "@/lib/cms/defaults/product";
import type { CmsDocumentFor, CmsKey } from "@/lib/cms/schemas";

export { homeDefaults } from "@/lib/cms/defaults/home";
export { fundedDefaults, tradingDefaults } from "@/lib/cms/defaults/product";

export const cmsDefaults = {
  home: homeDefaults,
  funded: fundedDefaults,
  trading: tradingDefaults,
} satisfies { [K in CmsKey]: CmsDocumentFor<K> };

export function getCmsDefaults<K extends CmsKey>(key: K): CmsDocumentFor<K> {
  return cmsDefaults[key] as CmsDocumentFor<K>;
}
