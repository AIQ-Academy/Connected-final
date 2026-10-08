import { ArrowRight } from "lucide-react";

import { MarketHotNewsGrid } from "@/components/sections/market-hot-news-grid";
import { GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { NewsArticle } from "@/db/schema";
import type { Locale } from "@/lib/i18n/locale";

export function MarketHotNewsSection({
  articles,
  locale,
  variant = "default",
  id,
  showViewAll = true,
}: {
  articles: NewsArticle[];
  locale: Locale;
  variant?: "default" | "compact";
  id?: string;
  showViewAll?: boolean;
}) {
  if (articles.length === 0) return null;

  const isCompact = variant === "compact";

  return (
    <Section
      id={id}
      className={
        isCompact
          ? "border-line-soft bg-raised/50 relative overflow-hidden border-y"
          : "relative overflow-hidden"
      }
    >
      {isCompact && <GridBackdrop className="opacity-60" />}

      <Container className="relative">
        <SectionHeading
          eyebrow={isCompact ? "Market desk" : "Hot news"}
          title={
            isCompact
              ? locale === "ar"
                ? "ما الذي يحرّك الأسواق الآن؟"
                : "What is moving markets right now."
              : "Market hot news"
          }
          lead={
            isCompact
              ? locale === "ar"
                ? "تحليلات فريق التداول حول مستويات الأسعار وتدفقات السوق ومخاطر الأحداث التي تؤثر في الصفقات المفتوحة — مع تحديثها على مدار الجلسة."
                : "Desk analysis on the levels, flows and event risk that matter to an open position — updated as the session develops."
              : "Breaking analysis from our trading desk: positioning, catalysts and the price action traders are watching across every asset class."
          }
          action={
            showViewAll ? (
              <ButtonLink href="/markets#news" variant="soft">
                View all
                <ArrowRight />
              </ButtonLink>
            ) : undefined
          }
        />

        <MarketHotNewsGrid articles={articles} variant={variant} />
      </Container>
    </Section>
  );
}
