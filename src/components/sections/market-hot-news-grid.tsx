"use client";

import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Badge, LiveDot } from "@/components/ui/badge";
import { RelativeTime } from "@/components/ui/relative-time";
import type { NewsArticle } from "@/db/schema";
import { getNewsCategoryImage } from "@/lib/images";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "analysis", label: "Analysis" },
  { key: "forex", label: "Forex" },
  { key: "commodities", label: "Commodities" },
  { key: "education", label: "Education" },
  { key: "indices", label: "Indices" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function categoryFilterKey(category: string): FilterKey {
  const value = category.toLowerCase();
  if (value.includes("analysis")) return "analysis";
  if (value === "forex") return "forex";
  if (value === "commodities") return "commodities";
  if (value === "education") return "education";
  if (value === "indices") return "indices";
  return "all";
}

function categoryTone(
  category: string,
): "neutral" | "brand" | "mint" | "amber" {
  switch (categoryFilterKey(category)) {
    case "analysis":
      return "brand";
    case "forex":
      return "mint";
    case "commodities":
      return "amber";
    case "indices":
      return "brand";
    default:
      return "neutral";
  }
}

function publishedAt(article: NewsArticle) {
  return article.publishedAt ?? article.createdAt;
}

export function MarketHotNewsGrid({
  articles,
  variant = "default",
}: {
  articles: NewsArticle[];
  variant?: "default" | "compact";
}) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const isCompact = variant === "compact";

  const filtered = useMemo(() => {
    if (activeFilter === "all") return articles;
    return articles.filter(
      (article) => categoryFilterKey(article.category) === activeFilter,
    );
  }, [activeFilter, articles]);

  if (filtered.length === 0) {
    return (
      <p className="text-muted mt-10 text-sm">
        No stories in this category yet. Try another filter or check back after
        the next session.
      </p>
    );
  }

  const [featured, ...secondary] = filtered;
  const rest = secondary.slice(0, isCompact ? 3 : 4);

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Filter news by category"
        className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {FILTERS.map((filter) => {
          const selected = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "border-line text-muted hover:text-ink shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors",
                selected &&
                  "border-brand/50 bg-brand/10 text-brand-light",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-5">
        <Reveal delay={0.04}>
          <FeaturedCard article={featured} compact={isCompact} />
        </Reveal>

        {rest.length > 0 && (
          <div
            className={cn(
              "flex gap-4 overflow-x-auto pb-2 sm:grid sm:overflow-visible sm:pb-0",
              isCompact
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {rest.map((article, index) => (
              <Reveal
                key={article.id}
                delay={0.06 + index * 0.04}
                className="w-[min(82vw,20rem)] shrink-0 sm:w-auto"
              >
                <SecondaryCard article={article} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({
  article,
  compact,
}: {
  article: NewsArticle;
  compact: boolean;
}) {
  const image = getNewsCategoryImage(article.category);
  const date = publishedAt(article);

  return (
    <article className="border-line-soft bg-panel hover:border-brand/40 group relative overflow-hidden rounded-2xl border transition-colors">
      <div
        className={cn(
          "grid",
          compact
            ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        )}
      >
        <div className="border-line-soft relative aspect-[16/10] overflow-hidden border-b md:border-r md:border-b-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div
            aria-hidden="true"
            className="from-bg/20 via-bg/5 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="border-mint/40 bg-bg/80 text-mint inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase backdrop-blur-sm">
              <LiveDot tone="mint" className="size-1.5" />
              Trending
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone={categoryTone(article.category)}>
              {article.category}
            </Badge>
            <RelativeTime
              date={date}
              className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.06em] uppercase"
            />
          </div>

          <h3 className="text-ink font-display group-hover:text-brand-light mt-4 text-xl leading-tight font-semibold transition-colors sm:text-2xl">
            <Link
              href={`/news/${article.slug}`}
              className="outline-none focus-visible:underline"
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {article.title}
            </Link>
          </h3>

          <p className="text-muted mt-3 max-w-2xl text-sm leading-relaxed sm:text-[0.9375rem]">
            {article.excerpt}
          </p>

          <div className="border-line-soft text-faint mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 text-xs">
            {article.author && (
              <span className="text-muted font-medium">{article.author}</span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {article.readMinutes} min read
            </span>
            <span className="text-brand-light ml-auto inline-flex items-center gap-1.5 font-medium">
              Read analysis
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryCard({ article }: { article: NewsArticle }) {
  const image = getNewsCategoryImage(article.category);
  const date = publishedAt(article);

  return (
    <article className="border-line-soft bg-panel hover:border-brand/40 group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors">
      <div className="border-line-soft relative aspect-[16/10] overflow-hidden border-b">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 82vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <Badge tone={categoryTone(article.category)} size="sm">
            {article.category}
          </Badge>
          <RelativeTime
            date={date}
            className="text-faint tabular font-mono text-[0.625rem] tracking-[0.06em] uppercase"
          />
        </div>

        <h3 className="text-ink font-display group-hover:text-brand-light mt-3 text-base leading-snug font-semibold transition-colors">
          <Link
            href={`/news/${article.slug}`}
            className="outline-none focus-visible:underline"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>

        <p className="text-muted mt-2 line-clamp-2 text-sm leading-relaxed">
          {article.excerpt}
        </p>

        <div className="text-faint mt-auto flex items-center gap-1.5 pt-4 text-xs">
          <Clock className="size-3.5" aria-hidden="true" />
          {article.readMinutes} min
        </div>
      </div>
    </article>
  );
}
