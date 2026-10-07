import { localizedPath, type Locale } from "./locale";
import { getServerLocale } from "./server";

/** Language URL map shared by route metadata and the sitemap. */
export function languageAlternates(pathname: string) {
  return {
    en: localizedPath(pathname, "en"),
    fr: localizedPath(pathname, "fr"),
    ar: localizedPath(pathname, "ar"),
  } satisfies Record<Locale, string>;
}

/** Route-aware canonical plus all language variants for locale-prefixed URLs. */
export async function routeAlternates(pathname: string) {
  const locale = await getServerLocale();
  return {
    canonical: localizedPath(pathname, locale),
    languages: languageAlternates(pathname),
  };
}
