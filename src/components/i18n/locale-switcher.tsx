"use client";

import { Languages } from "lucide-react";

import { locales, useLocale, type Locale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const { locale, setLocale, t } = useLocale();
  const onDark = tone === "onDark";

  return (
    <nav
      aria-label={t("header.language")}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-lg border px-2 text-[.68rem] font-semibold tracking-[.08em] transition-colors",
        onDark ? "border-white/25 bg-white/10 text-white/90" : "border-line bg-raised",
        className,
      )}
    >
      <Languages className="me-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {locales.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-current/35" aria-hidden="true">·</span>}
          <button
            type="button"
            onClick={() => setLocale(item as Locale)}
            aria-current={locale === item ? "true" : undefined}
            aria-label={t(`locale.${item}` as "locale.en" | "locale.fr" | "locale.ar")}
            aria-pressed={locale === item}
            className={cn(
              "rounded px-1 py-0.5 transition-colors",
              locale === item
                ? onDark
                  ? "bg-white/15 text-white"
                  : "bg-brand/12 text-brand-light"
                : onDark
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-muted hover:bg-brand-dim/40 hover:text-ink",
            )}
          >
            {item.toUpperCase()}
          </button>
        </span>
      ))}
    </nav>
  );
}
