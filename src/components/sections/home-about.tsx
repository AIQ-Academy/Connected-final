import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { HomeAboutContent } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { homeAbout as aboutDefaults } from "@/lib/landing/home";

const TERMS_HREF = "/legal/terms";
const TERMS_PHRASE = "Terms & Conditions";

export function HomeAboutSection({
  content,
  image,
}: {
  content?: HomeAboutContent;
  image?: ResolvedImage;
} = {}) {
  const homeAbout = {
    ...aboutDefaults,
    ...content,
    mission: { ...aboutDefaults.mission, ...content?.mission },
    vision: { ...aboutDefaults.vision, ...content?.vision },
    disclaimer: { ...aboutDefaults.disclaimer, ...content?.disclaimer },
  };
  const panel = image ?? marketingImages.about;
  const disclaimerParagraphs = [
    homeAbout.disclaimer.risk,
    homeAbout.disclaimer.advice,
    homeAbout.disclaimer.availability,
  ];

  return (
    <Section
      id={homeAbout.id}
      size="spacious"
      className="bg-noise border-line-soft scroll-mt-28 overflow-hidden border-t"
    >
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow">
                <span className="chev" />
                {homeAbout.eyebrow}
              </p>
              <h2 className="text-h1 mt-5 max-w-xl">{homeAbout.title}</h2>
              <p className="text-lead text-muted mt-6 max-w-xl">
                {homeAbout.lead}
              </p>
            </Reveal>

            <Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={homeAbout.primary.href} size="lg">
                {homeAbout.primary.label}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href={homeAbout.secondary.href}
                variant="soft"
                size="lg"
              >
                {homeAbout.secondary.label}
              </ButtonLink>
            </Reveal>
          </div>

          {/* The photograph and the quote are one composed object: the city is
              the ground, the quote sits on it under a scrim heavy enough to
              carry white text, and the attribution closes it out. */}
          <Reveal delay={0.1} direction="left" className="lg:col-span-6">
            <figure className="border-line-soft relative flex h-full min-h-[32rem] flex-col justify-end overflow-hidden rounded-3xl border sm:min-h-[34rem]">
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-center"
                {...("blurDataURL" in panel && panel.blurDataURL
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: panel.blurDataURL,
                    }
                  : {})}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_18_48/0.96)_0%,rgb(8_18_48/0.72)_38%,rgb(8_18_48/0.12)_76%)]"
              />

              {/* A second scrim sized to the text block rather than the figure.
                  The figure-wide gradient alone leaves the brightest city
                  lights at ~3.3:1 behind the quote on a phone, where the text
                  covers most of the frame. */}
              <div className="relative bg-[linear-gradient(to_top,rgb(8_18_48/0.97)_0%,rgb(8_18_48/0.9)_58%,transparent_100%)] p-7 pt-16 sm:p-9 sm:pt-20">
                <span aria-hidden className="bg-brand-light block h-[3px] w-12" />
                <blockquote className="mt-6">
                  <p className="font-display text-[1.375rem] leading-[1.4] font-medium text-white sm:text-[1.5rem]">
                    &ldquo;{homeAbout.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-7 flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-px w-7 shrink-0 bg-white/40"
                  />
                  <span className="text-[0.9375rem] leading-relaxed text-white/78">
                    The operating principle the risk desk works to
                  </span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>

        <Reveal
          delay={0.12}
          className="border-line-soft bg-line-soft mt-10 grid gap-px overflow-hidden rounded-[2rem] border sm:mt-12 lg:grid-cols-2"
        >
          {[homeAbout.mission, homeAbout.vision].map((statement) => (
            <article
              key={statement.eyebrow}
              className="bg-panel px-5 py-6 sm:px-7 sm:py-8"
            >
              <p className="text-faint font-mono text-[0.75rem] tracking-[0.16em] uppercase">
                {statement.eyebrow}
              </p>
              <p className="text-muted mt-3 text-[0.9375rem] leading-relaxed sm:text-base">
                {statement.body}
              </p>
            </article>
          ))}
        </Reveal>

        {/* Hairline strip rather than separate cards — the figures read as one
            row of the same object. */}
        <Reveal
          delay={0.14}
          className="border-line-soft bg-line-soft mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border lg:mt-12 lg:grid-cols-4"
        >
          {homeAbout.stats.map((stat) => (
            <div key={stat.label} className="bg-panel px-5 py-7 sm:px-8 sm:py-9">
              <p className="text-ink font-display tabular text-[1.625rem] leading-none font-semibold tracking-[-0.02em] sm:text-[2.25rem]">
                {stat.value}
              </p>
              <p className="text-faint mt-3.5 font-mono text-[0.75rem] tracking-[0.16em] uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.16}>
          <aside className="border-line-soft mt-8 rounded-md border px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              {homeAbout.disclaimer.title}
            </p>
            <div className="text-faint mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed">
              {disclaimerParagraphs.map((paragraph) => (
                <p key={paragraph}>{linkTerms(paragraph)}</p>
              ))}
            </div>
          </aside>
        </Reveal>
      </Container>
    </Section>
  );
}

function linkTerms(text: string): ReactNode {
  const index = text.indexOf(TERMS_PHRASE);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <Link
        href={TERMS_HREF}
        className="hover:text-ink underline decoration-current/40 underline-offset-2 transition-colors"
      >
        {TERMS_PHRASE}
      </Link>
      {text.slice(index + TERMS_PHRASE.length)}
    </>
  );
}
