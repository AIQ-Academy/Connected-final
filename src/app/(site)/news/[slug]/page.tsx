import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { getNewsBySlug } from "@/db/queries";
import { newsSeed } from "@/db/seed-data";
import { getNewsCategoryImage } from "@/lib/images";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return newsSeed.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return { title: "Market news" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) notFound();

  const image = getNewsCategoryImage(article.category);
  const published = article.publishedAt ?? article.createdAt;
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(published);

  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-10 sm:pt-20">
        <Aurora intensity="subtle" />
        <GridBackdrop />
        <Container className="relative">
          <Reveal direction="none">
            <ButtonLink href="/markets#news" variant="ghost" size="sm">
              <ArrowLeft />
              Back to hot news
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.06} className="mt-6 flex flex-wrap items-center gap-3">
            <Eyebrow>Market desk</Eyebrow>
            <Badge tone="brand">{article.category}</Badge>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-h1 mt-5 max-w-3xl">{article.title}</h1>
          </Reveal>

          <Reveal
            delay={0.14}
            className="text-faint mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase"
          >
            {article.author && (
              <span className="text-muted">{article.author}</span>
            )}
            <time dateTime={published.toISOString()}>{formattedDate}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {article.readMinutes} min read
            </span>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <Reveal className="border-line-soft relative aspect-[16/10] overflow-hidden rounded-2xl border lg:sticky lg:top-28">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </Reveal>

            <Reveal delay={0.08} className="max-w-2xl">
              <p className="text-lead text-muted leading-relaxed">
                {article.excerpt}
              </p>

              {article.body ? (
                <div className="text-muted prose prose-invert mt-8 max-w-none text-base leading-relaxed">
                  {article.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="mt-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted border-line-soft bg-raised/40 mt-8 rounded-2xl border p-5 text-sm leading-relaxed">
                  Full article publishing soon. In the meantime, open the market
                  terminal for live quotes, the economic calendar and technical
                  ratings on the instruments referenced in this note.
                </p>
              )}

              <div className="mt-10">
                <ButtonLink href="/markets" variant="soft">
                  Open market terminal
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
