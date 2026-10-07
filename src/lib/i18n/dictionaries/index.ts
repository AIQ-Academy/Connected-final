import type { Locale } from "../locale";
import en, { type DictionaryKey } from "./en";
import ar from "./ar";
import fr from "./fr";

export type { DictionaryKey };
export type Dictionary = Record<DictionaryKey, string>;

const dictionaries: Record<Locale, Dictionary> = { en, ar, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/** Plain lookup — safe to call from Server or Client Components alike. */
export function translate(locale: Locale, key: DictionaryKey): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
