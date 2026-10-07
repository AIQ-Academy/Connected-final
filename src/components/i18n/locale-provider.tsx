"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/dictionaries";
import { defaultLocale, directionFor, LOCALE_COOKIE, localizedPath, locales, type Locale } from "@/lib/i18n/locale";

export { locales };
export type { Locale };

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: DictionaryKey) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, options?: { currency?: string; decimals?: number }) => string;
  formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "connect-locale";

/** One year — matches how long a returning visitor's language choice should stick. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Locale resolved server-side from the cookie, so the first paint already matches. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale);
  const direction = directionFor(locale);

  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.dataset.locale = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
    writeLocaleCookie(locale);
  }, [direction, locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction,
      setLocale: (next) => {
        if (next === locale || typeof window === "undefined") return;
        setLocaleState(next);
        document.documentElement.lang = next;
        document.documentElement.dir = directionFor(next);
        window.localStorage.setItem(STORAGE_KEY, next);
        writeLocaleCookie(next);
        const target = localizedPath(window.location.pathname, next);
        router.push(`${target}${window.location.search}${window.location.hash}`);
      },
      t: (key) => translate(locale, key),
      formatNumber: (value, options) => new Intl.NumberFormat(localeTag(locale), options).format(value),
      formatCurrency: (value, { currency = "USD", decimals = 0 } = {}) => new Intl.NumberFormat(localeTag(locale), {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value),
      formatDate: (value, options) => new Intl.DateTimeFormat(localeTag(locale), options).format(value),
    }),
    [direction, locale, router],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function localeTag(locale: Locale): string {
  return locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US";
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
