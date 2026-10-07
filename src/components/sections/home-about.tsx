'use client';

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { HomeAboutContent } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { homeAbout as aboutDefaults } from "@/lib/landing/home";
import { useLocale } from "@/components/i18n/locale-provider";
import { getCompanyStats } from "@/lib/content";

const outlineOnDark =
  "border-white/45 bg-transparent text-white hover:border-white hover:bg-white/8 hover:text-white";

/** Shared cool accent keeps the adjoining dark sections visually consistent. */
const ACCENT = "var(--cf-palette-6)";

const TERMS_HREF = "/legal/terms";
const TERMS_PHRASE = "Terms & Conditions";

export function HomeAboutSection({
  content,
  image,
}: {
  content?: HomeAboutContent;
  image?: ResolvedImage;
} = {}) {
  const { locale, t } = useLocale();
  const source = {
    ...aboutDefaults,
    ...content,
    mission: { ...aboutDefaults.mission, ...content?.mission },
    vision: { ...aboutDefaults.vision, ...content?.vision },
    disclaimer: { ...aboutDefaults.disclaimer, ...content?.disclaimer },
  };
  const homeAbout = locale === "en" ? source : {
    ...source,
    eyebrow: t("home.about.eyebrow"), title: t("home.about.title"),
    lead: t("home.about.lead"), quote: t("home.about.quote"),
    primary: { ...source.primary, label: t("home.about.primary") },
    secondary: { ...source.secondary, label: t("home.about.secondary") },
    mission: { eyebrow: t("home.about.mission"), body: t("home.about.missionBody") },
    vision: { eyebrow: t("home.about.vision"), body: t("home.about.visionBody") },
    disclaimer: {
      title: t("home.about.disclaimerTitle"), risk: t("home.about.risk"),
      advice: t("home.about.advice"), availability: t("home.about.availability"),
    },
    stats: getCompanyStats(locale),
  };
  const termsPhrase = locale === "en" ? TERMS_PHRASE : t("home.about.termsPhrase");
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
      className="trading-horizon scroll-mt-28 overflow-hidden border-t border-white/10 text-white"
    >
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-white/75">
                <span className="chev" style={{ background: ACCENT }} />
                {homeAbout.eyebrow}
              </p>
              <h2 className="text-h1 mt-5 max-w-xl text-white">
                {homeAbout.title}
              </h2>
              <p className="text-lead mt-6 max-w-xl text-white/80">
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
                variant="outline"
                size="lg"
                className={outlineOnDark}
              >
                {homeAbout.secondary.label}
              </ButtonLink>
            </Reveal>
          </div>

          {/* The photograph and the quote are one composed object: the city is
              the ground, the quote sits on it under a scrim heavy enough to
              carry white text, and the attribution closes it out. */}
          <Reveal delay={0.1} direction="left" className="lg:col-span-6">
            <figure className="relative flex h-full min-h-[32rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/16 sm:min-h-[34rem]">
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
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.96)_0%,rgb(var(--cf-hero-rgb)/0.72)_38%,rgb(var(--cf-hero-rgb)/0.12)_76%)]"
              />

              {/* A second scrim sized to the text block rather than the figure.
                  The figure-wide gradient alone leaves the brightest city
                  lights at ~3.3:1 behind the quote on a phone, where the text
                  covers most of the frame. */}
              <div className="relative bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.97)_0%,rgb(var(--cf-hero-rgb)/0.9)_58%,transparent_100%)] p-7 pt-16 sm:p-9 sm:pt-20">
                <span
                  aria-hidden
                  className="block h-[3px] w-12"
                  style={{ background: ACCENT }}
                />
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
                    {t("home.about.caption")}
                  </span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>

        <Reveal
          delay={0.12}
          className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-white/16 bg-white/12 sm:mt-12 lg:grid-cols-2"
        >
          {[homeAbout.mission, homeAbout.vision].map((statement) => (
            <article key={statement.eyebrow} className="bg-[var(--cf-terminal-bg)] px-5 py-6 sm:px-7 sm:py-8">
              <p className="font-mono text-[0.75rem] tracking-[0.16em] text-white/68 uppercase">
                {statement.eyebrow}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/80 sm:text-base">
                {statement.body}
              </p>
            </article>
          ))}
        </Reveal>

        {/* Same strip treatment as the trading band above, so the two dark
            sections close the same way. */}
        <Reveal
          delay={0.14}
          className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/16 bg-white/12 lg:mt-12 lg:grid-cols-4"
        >
          {homeAbout.stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--cf-terminal-bg)] px-5 py-7 sm:px-8 sm:py-9"
            >
              <p className="font-display tabular text-[1.625rem] leading-none font-semibold tracking-[-0.02em] text-white sm:text-[2.25rem]">
                {stat.value}
              </p>
              <p className="mt-3.5 font-mono text-[0.75rem] tracking-[0.16em] text-white/68 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.16}>
          <aside className="mt-8 rounded-md border border-white/12 px-5 py-5 sm:px-6 sm:py-6">
            <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-white/45 uppercase">
              {homeAbout.disclaimer.title}
            </p>
            <div className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-white/50">
              {disclaimerParagraphs.map((paragraph) => (
              <p key={paragraph}>{linkTerms(paragraph, termsPhrase)}</p>
              ))}
            </div>
          </aside>
        </Reveal>
      </Container>
    </Section>
  );
}

function linkTerms(text: string, termsPhrase: string): ReactNode {
  const index = text.indexOf(termsPhrase);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <Link
        href={TERMS_HREF}
        className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/70 hover:decoration-white/55"
      >
        {termsPhrase}
      </Link>
      {text.slice(index + termsPhrase.length)}
    </>
  );
}
