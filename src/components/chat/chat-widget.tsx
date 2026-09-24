"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, MessageSquare, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { LogoMark } from "@/components/brand/logo";
import {
  fundingFaqCategories,
  fundingFaqs,
  type FundingFaq,
} from "@/lib/funding-faq";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cf:chat-open";
const ALL = "all";

/**
 * Open/closed state lives outside React so it can be read from localStorage
 * without a setState-in-effect cascade, and so the server snapshot is always
 * "closed" — the panel then opens on the client without a hydration mismatch.
 */
const openState = {
  value: null as boolean | null,
  listeners: new Set<() => void>(),

  subscribe(listener: () => void) {
    openState.listeners.add(listener);
    return () => openState.listeners.delete(listener);
  },

  read() {
    if (openState.value === null) {
      try {
        openState.value = window.localStorage.getItem(STORAGE_KEY) === "open";
      } catch {
        // Private browsing or storage disabled — the widget still works.
        openState.value = false;
      }
    }
    return openState.value;
  },

  write(next: boolean) {
    openState.value = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
    } catch {
      // Ignore: it just will not be remembered next visit.
    }
    for (const listener of openState.listeners) listener();
  },
};

export function ChatWidget() {
  const open = useSyncExternalStore(
    openState.subscribe,
    openState.read,
    () => false,
  );
  const setOpen = openState.write;

  const reduced = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of fundingFaqs) {
      map.set(faq.category, (map.get(faq.category) ?? 0) + 1);
    }
    return map;
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return fundingFaqs.filter((faq) => {
      if (category !== ALL && faq.category !== category) return false;
      if (!needle) return true;
      return (
        faq.question.toLowerCase().includes(needle) ||
        faq.answer.toLowerCase().includes(needle)
      );
    });
  }, [query, category]);

  const grouped = useMemo(
    () =>
      fundingFaqCategories
        .map((name) => ({
          name,
          items: results.filter((faq) => faq.category === name),
        }))
        .filter((group) => group.items.length > 0),
    [results],
  );

  const filtered = Boolean(query.trim()) || category !== ALL;
  const singleResult = results.length === 1;
  const openId =
    results.length === 1
      ? results[0].id
      : selectedId && results.some((faq) => faq.id === selectedId)
        ? selectedId
        : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
    setSelectedId(null);
  }

  function closePanel() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  return (
    <>
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="cf-chat-panel"
        aria-label={open ? "Close the funding FAQ" : "Open the funding FAQ"}
        className={cn(
          "bg-brand btn-glow fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] grid size-14 place-items-center rounded-full text-white transition-colors sm:right-6 sm:bottom-6",
          "hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-4",
        )}
        // Neutralised by value, never by dropping the prop: Motion manages
        // this element's tabindex only while a tap gesture is declared, and the
        // server cannot know the motion preference, so removing it on the
        // client is a hydration mismatch on that attribute.
        whileTap={{ scale: reduced ? 1 : 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{
              opacity: 0,
              rotate: reduced ? 0 : -35,
              scale: reduced ? 1 : 0.7,
            }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={
              reduced ? { opacity: 0 } : { opacity: 0, rotate: 35, scale: 0.7 }
            }
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {open ? (
              <X className="size-6" />
            ) : (
              <MessageSquare className="size-[22px]" />
            )}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span
            aria-hidden="true"
            className="bg-mint border-bg absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-2"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close the funding FAQ"
              className="fixed inset-0 z-[64] bg-[#06070e]/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closePanel}
            />

            <motion.div
              id="cf-chat-panel"
              role="dialog"
              aria-label="Funding and payout FAQ"
              aria-modal="true"
              className={cn(
                "bg-raised fixed z-[65] flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[0_28px_90px_-24px_rgb(var(--cf-shadow-color)/0.55)]",
                "inset-x-3 top-20 bottom-22",
                "sm:inset-auto sm:right-6 sm:bottom-24 sm:top-auto sm:h-[min(36rem,calc(100dvh-9rem))] sm:w-[24.5rem]",
              )}
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="border-line-soft bg-panel flex items-center gap-3 border-b px-4 py-3.5">
                <span className="border-brand/35 bg-brand/12 grid size-10 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)]">
                  <LogoMark className="h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.9375rem] leading-tight font-semibold">
                    Funding FAQ
                  </p>
                  <p className="text-muted flex items-center gap-1.5 text-[0.75rem]">
                    <span
                      className="bg-mint size-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    {fundingFaqs.length} answers · pick a question
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close the funding FAQ"
                  className="text-muted hover:text-ink hover:bg-sunken grid size-8 place-items-center rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </header>

              <div className="border-line-soft bg-panel border-b px-4 py-3">
                <label htmlFor={searchId} className="sr-only">
                  Search {fundingFaqs.length} answers
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="text-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  />
                  <input
                    id={searchId}
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="deposit, payout, limit…"
                    autoComplete="off"
                    className="border-line bg-raised text-ink placeholder:text-faint focus:border-brand-light h-10 w-full rounded-full border pr-3 pl-9 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]"
                  />
                </div>

                <nav
                  aria-label="Filter answers by category"
                  className="-mx-1 mt-3 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <ul className="flex w-max gap-1.5">
                    <li>
                      <CategoryChip
                        active={category === ALL}
                        count={fundingFaqs.length}
                        onClick={() => setCategory(ALL)}
                      >
                        All topics
                      </CategoryChip>
                    </li>
                    {fundingFaqCategories.map((name) => (
                      <li key={name}>
                        <CategoryChip
                          active={category === name}
                          count={counts.get(name) ?? 0}
                          onClick={() => setCategory(name)}
                        >
                          {name}
                        </CategoryChip>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="bg-bg flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p
                    role="status"
                    className="text-faint font-mono text-[0.6875rem] tracking-[0.1em] uppercase"
                  >
                    {results.length} answer{singleResult ? "" : "s"}
                    {filtered ? " matching" : " in total"}
                  </p>
                  {filtered && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-brand-light inline-flex items-center gap-1 text-[0.75rem] font-semibold"
                    >
                      <X className="size-3" aria-hidden="true" />
                      Clear
                    </button>
                  )}
                </div>

                {grouped.length === 0 ? (
                  <div className="border-line-soft rounded-2xl border border-dashed px-4 py-10 text-center">
                    <p className="text-ink font-display text-[0.9375rem] font-semibold">
                      No answer matches that search.
                    </p>
                    <p className="text-muted mx-auto mt-2 max-w-xs text-[0.8125rem] leading-relaxed">
                      Try a single word such as deposit, payout or limit — or
                      send the question to the desk.
                    </p>
                    <Link
                      href="/contact"
                      onClick={closePanel}
                      className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
                    >
                      Ask the desk
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {grouped.map((group) => (
                      <section
                        key={group.name}
                        aria-labelledby={`chat-faq-${slug(group.name)}`}
                      >
                        <div className="border-line-soft mb-1 flex items-baseline justify-between gap-3 border-b pb-2">
                          <h2
                            id={`chat-faq-${slug(group.name)}`}
                            className="text-ink font-display text-sm font-semibold"
                          >
                            {group.name}
                          </h2>
                          <span className="text-faint tabular font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                            {group.items.length}
                          </span>
                        </div>
                        <div>
                          {group.items.map((faq) => (
                            <FaqQuestionRow
                              key={faq.id}
                              faq={faq}
                              open={openId === faq.id}
                              reduced={Boolean(reduced)}
                              onToggle={() =>
                                setSelectedId((current) =>
                                  current === faq.id ? null : faq.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              <footer className="border-line-soft bg-panel border-t px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href="/faq"
                    onClick={closePanel}
                    className="text-brand-light inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
                  >
                    Browse all answers
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closePanel}
                    className="text-muted hover:text-ink text-[0.8125rem] font-medium"
                  >
                    Contact the desk
                  </Link>
                </div>
                <p className="text-faint mt-2 text-[0.6875rem] leading-relaxed">
                  Same answers as the FAQ page. General information only,
                  never financial advice.
                </p>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function CategoryChip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand/45 bg-brand/12 text-brand-light"
          : "border-line bg-raised text-muted hover:text-ink hover:bg-sunken",
      )}
    >
      {children}
      <span className="tabular font-mono text-[0.625rem] opacity-70">
        {count}
      </span>
    </button>
  );
}

function FaqQuestionRow({
  faq,
  open,
  reduced,
  onToggle,
}: {
  faq: FundingFaq;
  open: boolean;
  reduced: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-line-soft border-b last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`chat-faq-panel-${faq.id}`}
          id={`chat-faq-trigger-${faq.id}`}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-3 py-3 text-left"
        >
          <span className="text-ink text-[0.8125rem] leading-snug font-medium">
            {faq.question}
          </span>
          <span
            className={cn(
              "border-line text-muted group-hover:border-brand-light group-hover:text-brand-light mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-all duration-300",
              open && "border-brand bg-brand rotate-45 text-white",
            )}
          >
            <Plus className="size-3" aria-hidden="true" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={`chat-faq-panel-${faq.id}`}
            role="region"
            aria-labelledby={`chat-faq-trigger-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.01 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden"
          >
            <p className="text-muted pb-3.5 text-[0.8125rem] leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatWidget;
