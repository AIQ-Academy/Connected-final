"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  searchSite,
  type SearchResult,
  type SearchResultKind,
} from "@/lib/search-index";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function SiteSearch({ className }: { className?: string }) {
  const { t, direction } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [cmsEntries, setCmsEntries] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();
  const dialogTitleId = useId();

  // CMS-driven page copy is fetched the first time the palette opens, so a
  // headline an editor changed is searchable. The static index carries the
  // palette on its own if this never resolves.
  useEffect(() => {
    if (!open || cmsEntries.length > 0) return;
    let cancelled = false;

    fetch("/api/search/cms")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { entries?: SearchResult[] } | null) => {
        if (!cancelled && payload?.entries?.length) {
          setCmsEntries(payload.entries);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open, cmsEntries.length]);

  const results = useMemo(
    () => searchSite(query, 12, cmsEntries),
    [query, cmsEntries],
  );

  const grouped = useMemo(() => {
    const map = new Map<SearchResultKind, SearchResult[]>();
    for (const result of results) {
      const list = map.get(result.kind) ?? [];
      list.push(result);
      map.set(result.kind, list);
    }
    return (["page", "faq", "instrument"] as const)
      .map((kind) => ({ kind, items: map.get(kind) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [results]);

  const flatResults = useMemo(
    () => grouped.flatMap((group) => group.items),
    [grouped],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [open]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flatResults.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && flatResults[activeIndex]) {
      event.preventDefault();
      window.location.href = flatResults[activeIndex].href;
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "border-line text-muted hover:text-ink hover:border-brand-light/50 hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors md:inline-flex",
          className,
        )}
        aria-label={t("ui.searchOpen")}
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden lg:inline">{t("header.search")}</span>
        <kbd className="border-line bg-sunken text-faint hidden rounded px-1.5 py-0.5 font-mono text-[0.625rem] lg:inline">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("ui.searchOpen")}
        className={cn(
          "border-line text-ink grid size-9 place-items-center rounded-lg border md:hidden",
          className,
        )}
      >
        <Search className="size-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.18 }}
            className="fixed inset-0 z-[80] flex items-start justify-center bg-[rgb(var(--cf-hero-rgb)/0.72)] p-4 pt-[12vh] backdrop-blur-sm sm:p-6"
            role="presentation"
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              initial={{
                opacity: 0,
                y: reduced ? 0 : -12,
                scale: reduced ? 1 : 0.98,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: reduced ? 0 : -8,
                scale: reduced ? 1 : 0.98,
              }}
              transition={{
                duration: reduced ? 0.01 : 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-line bg-panel w-full max-w-xl overflow-hidden rounded-2xl border"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-line-soft flex items-center gap-3 border-b px-4">
                <Search
                  className="text-faint size-4 shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder={t("ui.searchPlaceholder")}
                  className="text-ink placeholder:text-faint h-12 flex-1 bg-transparent text-sm outline-none"
                  aria-controls="site-search-results"
                  aria-autocomplete="list"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("ui.searchClose")}
                  className="text-muted hover:text-ink grid size-8 place-items-center rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div
                id="site-search-results"
                className="max-h-[min(60vh,420px)] overflow-y-auto p-2"
                role="listbox"
                aria-label={t("ui.searchResults")}
              >
                <p id={dialogTitleId} className="sr-only">
                  {t("ui.searchSite")}
                </p>

                {flatResults.length === 0 ? (
                  <p className="text-muted px-3 py-8 text-center text-sm">
                    {t("ui.searchEmpty").replace("{query}", query)}
                  </p>
                ) : (
                  grouped.map((group) => (
                    <div key={group.kind} className="mb-2">
                      <p className="text-faint px-3 py-2 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                        {t(`ui.search${group.kind === "page" ? "Pages" : group.kind === "faq" ? "Faq" : "Markets"}` as "ui.searchPages" | "ui.searchFaq" | "ui.searchMarkets")}
                      </p>
                      <ul className="space-y-0.5">
                        {group.items.map((result) => {
                          const index = flatResults.indexOf(result);
                          const active = index === activeIndex;
                          return (
                            <li key={result.id}>
                              <Link
                                href={result.href}
                                role="option"
                                aria-selected={active}
                                onClick={close}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors",
                                  active
                                    ? "bg-brand/12 text-ink"
                                    : "text-muted hover:bg-sunken/80 hover:text-ink",
                                )}
                              >
                                <span className="min-w-0">
                                  <span className="text-ink block truncate text-sm font-medium">
                                    {result.title}
                                  </span>
                                  {result.subtitle && (
                                    <span className="block truncate text-xs opacity-80">
                                      {result.subtitle}
                                    </span>
                                  )}
                                </span>
                                <ArrowRight
                                  className={cn(
                                    "size-3.5 shrink-0 transition-opacity",
                                    direction === "rtl" && "rotate-180",
                                    active ? "opacity-70" : "opacity-0",
                                  )}
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="border-line-soft text-faint flex items-center justify-between gap-3 border-t px-4 py-2.5 font-mono text-[0.625rem] tracking-wide">
                <span>{t("ui.searchNavigation")}</span>
                <span>{t("ui.searchDismiss")}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
