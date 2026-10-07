"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { useLocale } from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  brokerHowItWorksHeading,
  brokerHowItWorksStages,
} from "@/lib/landing/broker";
import type { Heading } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";

type HowItWorksSectionProps = {
  /** CMS copy. Falls back to the shipped heading. */
  heading?: Heading;
  /** Resolved stage images, in stage order. Falls back to the Unsplash set. */
  frames?: ResolvedImage[];
};

export function HowItWorksSection({
  heading: headingOverride,
  frames,
}: HowItWorksSectionProps) {
  const stages = brokerHowItWorksStages;
  const heading = headingOverride ?? brokerHowItWorksHeading;
  const { t } = useLocale();

  return (
    <Section className="!pt-0 " id="how-it-works" size="spacious">
      <Container>
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          action={
            <ButtonLink href={heading.actionHref} variant="outline">
              {heading.actionLabel}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
            {t("howItWorks.swipeHint")}
          </p>

          <StaggerGroup
            role="list"
            className="mobile-snap-rail gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5"
          >
            {stages.map((stage, index) => {
              const frame =
                frames?.[index] ?? marketingImages.brokerHowItWorks[index];
              return (
                <StaggerItem
                  role="listitem"
                  key={stage.index}
                  className="mobile-snap-card w-[74vw] sm:w-auto"
                >
                  <article className="group relative isolate overflow-hidden rounded-2xl">
                    <div className="relative aspect-[3/4] sm:aspect-[3/4]">
                    {frame && (
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover brightness-105 saturate-110 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        {...("blurDataURL" in frame && frame.blurDataURL
                          ? {
                              placeholder: "blur" as const,
                              blurDataURL: frame.blurDataURL,
                            }
                          : {})}
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.78)_0%,rgb(var(--cf-hero-rgb)/0.18)_36%,transparent_68%)]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-5 start-5 font-mono text-[0.6875rem] tracking-[0.18em] text-white/70 uppercase"
                    >
                      {stage.index}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <span className="font-mono text-[0.625rem] tracking-[0.18em] text-white/65 uppercase">
                        {stage.kicker}
                      </span>
                      <h3 className="font-display mt-2 text-lg leading-snug font-semibold text-white sm:text-[1.35rem]">
                        {stage.title}
                      </h3>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
          </StaggerGroup>
        </div>
      </Container>
    </Section>
  );
}
