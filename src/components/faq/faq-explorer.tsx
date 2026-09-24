"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const ALL = "all";

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

function categorySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function FaqExplorer({ faqs }: { faqs: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const searchId = useId();

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const faq of faqs) {
      if (!seen.includes(faq.category)) seen.push(faq.category);
    }
    return seen;
  }, [faqs]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of faqs) {
      map.set(faq.category, (map.get(faq.category) ?? 0) + 1);
    }
    return map;
  }, [faqs]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      if (category !== ALL && faq.category !== category) return false;
      if (!needle) return true;
      return (
        faq.question.toLowerCase().includes(needle) ||
        faq.answer.toLowerCase().includes(needle)
      );
    });
  }, [faqs, query, category]);

  const grouped = useMemo(
    () =>
      categories
        .map((name) => ({
          name,
          items: results.filter((faq) => faq.category === name),
        }))
        .filter((group) => group.items.length > 0),
    [categories, results],
  );

  const filtered = Boolean(query.trim()) || category !== ALL;
  const singleResult = results.length === 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <label
          htmlFor={searchId}
          className="text-muted mb-2 block text-[0.8125rem] font-medium"
        >
          Search {faqs.length} answers
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-faint pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="deposit, payout, limit…"
            autoComplete="off"
            className="border-line bg-raised text-ink placeholder:text-faint focus:border-brand-light h-11 w-full rounded-full border pr-3 pl-10 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]"
          />
        </div>

        <nav aria-label="Filter answers by category" className="mt-6">
          <ul className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
            <li>
              <CategoryButton
                active={category === ALL}
                count={faqs.length}
                onClick={() => setCategory(ALL)}
              >
                All topics
              </CategoryButton>
            </li>
            {categories.map((name) => (
              <li key={name}>
                <CategoryButton
                  active={category === name}
                  count={counts.get(name) ?? 0}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </CategoryButton>
              </li>
            ))}
          </ul>
        </nav>

        <p
          role="status"
          className="text-faint border-line-soft mt-5 border-t pt-4 font-mono text-[0.6875rem] tracking-[0.1em] uppercase"
        >
          {results.length} answer{singleResult ? "" : "s"}
          {filtered ? " matching" : " in total"}
        </p>

        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
            }}
            className="text-brand-light mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}

        <div className="border-line-soft bg-panel mt-8 hidden rounded-2xl border p-5 lg:block">
          <p className="text-ink text-sm font-semibold">Still stuck?</p>
          <p className="text-muted mt-1.5 text-[0.8125rem] leading-relaxed">
            Support answers inside the portal during market hours.
          </p>
          <Link
            href="/contact"
            className="text-brand-light mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
          >
            Contact the desk
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div>
        {grouped.length === 0 ? (
          <div className="border-line-soft rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="text-ink font-display text-lg font-semibold">
              No answer matches that search.
            </p>
            <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
              Try a single word such as deposit, payout or limit — or send the
              question to the desk and we will answer it directly.
            </p>
            <Link
              href="/contact"
              className="text-brand-light mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              Ask the desk
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {grouped.map((group) => (
              <section
                key={group.name}
                id={`faq-${categorySlug(group.name)}`}
                aria-labelledby={`faq-heading-${categorySlug(group.name)}`}
                className="scroll-mt-28"
              >
                <div className="border-line-soft mb-2 flex items-baseline justify-between gap-4 border-b pb-3">
                  <h2
                    id={`faq-heading-${categorySlug(group.name)}`}
                    className="text-ink font-display text-xl font-semibold"
                  >
                    {group.name}
                  </h2>
                  <span className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                    {group.items.length} answer
                    {group.items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <Accordion>
                  {group.items.map((faq) => (
                    <div
                      key={`${faq.id}-${singleResult ? "solo" : "many"}`}
                      id={faq.id}
                      className="scroll-mt-28"
                    >
                      <AccordionItem
                        question={faq.question}
                        defaultOpen={singleResult}
                      >
                        {faq.answer}
                      </AccordionItem>
                    </div>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({
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
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left text-[0.8125rem] font-medium transition-colors",
        active
          ? "border-brand/45 bg-brand/12 text-brand-light"
          : "border-transparent text-muted hover:text-ink hover:bg-sunken",
      )}
    >
      {children}
      <span className="tabular font-mono text-[0.6875rem] opacity-70">
        {count}
      </span>
    </button>
  );
}
