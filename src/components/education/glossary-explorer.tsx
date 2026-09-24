"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import {
  glossary,
  glossaryCategories,
  glossaryLetters,
  type GlossaryCategory,
} from "@/lib/education-content";
import { cn } from "@/lib/utils";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type CategoryFilter = GlossaryCategory | "all";

export function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const searchId = useId();

  const available = useMemo(() => new Set(glossaryLetters), []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return glossary
      .filter((entry) => {
        if (letter && entry.term[0].toUpperCase() !== letter) return false;
        if (category !== "all" && entry.category !== category) return false;
        if (!needle) return true;
        return (
          entry.term.toLowerCase().includes(needle) ||
          entry.definition.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, letter, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const entry of results) {
      const key = entry.term[0].toUpperCase();
      const bucket = map.get(key);
      if (bucket) bucket.push(entry);
      else map.set(key, [entry]);
    }
    return [...map.entries()];
  }, [results]);

  const filtered = Boolean(query.trim()) || letter !== null || category !== "all";

  function reset() {
    setQuery("");
    setLetter(null);
    setCategory("all");
  }

  return (
    <div>
      <div className="border-line-soft bg-panel rounded-2xl border p-5 sm:p-6">
        <label
          htmlFor={searchId}
          className="text-muted mb-2 block text-[0.8125rem] font-medium"
        >
          Search {glossary.length} terms
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-faint pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ask, bid, spread, margin, leverage…"
            autoComplete="off"
            className="border-line bg-raised text-ink placeholder:text-faint focus:border-brand-light h-12 w-full rounded-full border pr-4 pl-11 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter glossary by category"
          className="mt-4 flex flex-wrap gap-1.5"
        >
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All areas
          </Chip>
          {glossaryCategories.map((value) => (
            <Chip
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
            </Chip>
          ))}
        </div>

        <nav
          aria-label="Glossary alphabet index"
          className="border-line-soft mt-5 flex flex-wrap gap-1 border-t pt-5"
        >
          <button
            type="button"
            onClick={() => setLetter(null)}
            aria-pressed={letter === null}
            className={cn(
              "h-8 rounded-lg px-2.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors",
              letter === null
                ? "bg-brand/15 text-brand-light"
                : "text-faint hover:text-ink hover:bg-sunken",
            )}
          >
            All
          </button>
          {ALPHABET.map((char) => {
            const enabled = available.has(char);
            return (
              <button
                key={char}
                type="button"
                disabled={!enabled}
                onClick={() => setLetter(letter === char ? null : char)}
                aria-pressed={letter === char}
                aria-label={`Show terms beginning with ${char}`}
                className={cn(
                  "grid size-8 place-items-center rounded-lg font-mono text-[0.75rem] transition-colors",
                  !enabled && "text-faint/40 cursor-not-allowed",
                  enabled && letter === char && "bg-brand text-white",
                  enabled &&
                    letter !== char &&
                    "text-muted hover:text-ink hover:bg-sunken",
                )}
              >
                {char}
              </button>
            );
          })}
        </nav>

        <div className="border-line-soft mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p role="status" className="text-faint font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
            {results.length} term{results.length === 1 ? "" : "s"}
            {filtered ? " matching" : " in the glossary"}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={reset}
              className="text-brand-light inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-muted border-line-soft mt-6 rounded-2xl border border-dashed px-6 py-14 text-center text-sm">
          Nothing matches that yet. Try a shorter word, or clear the filters and
          browse the full list.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {grouped.map(([initial, entries]) => (
            <section key={initial} aria-labelledby={`glossary-${initial}`}>
              <div className="border-line-soft mb-5 flex items-center gap-4 border-b pb-2">
                <h3
                  id={`glossary-${initial}`}
                  className="text-brand-light font-display text-xl font-semibold"
                >
                  {initial}
                </h3>
                <span className="text-faint tabular font-mono text-[0.6875rem]">
                  {entries.length}
                </span>
              </div>

              <dl className="grid gap-5 lg:grid-cols-2">
                {entries.map((entry) => (
                  <div
                    key={entry.term}
                    className="border-line-soft bg-panel hover:border-line rounded-2xl border p-5 transition-colors"
                  >
                    <dt className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-ink font-display text-base font-semibold">
                        {entry.term}
                      </span>
                      <span className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                        {entry.category}
                      </span>
                    </dt>
                    <dd className="text-muted mt-2 text-sm leading-relaxed">
                      {entry.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
        active
          ? "border-brand bg-brand/15 text-brand-light"
          : "border-line text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
