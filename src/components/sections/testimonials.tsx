import { Star } from "lucide-react";
import Image from "next/image";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/db/schema";
import type { PlainHeading } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { getTestimonialPortrait } from "@/lib/images";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const defaultHeading: PlainHeading = {
  eyebrow: "Funded traders",
  title: "Paid, on the day we said we would.",
  lead: "Every quote below comes from a trader on a live funded account, published with the tier they trade and the payout it produced.",
};

export function TestimonialsSection({
  testimonials,
  heading = defaultHeading,
  portraits,
}: {
  testimonials: Testimonial[];
  heading?: PlainHeading;
  /** Resolved portraits keyed by author name. Falls back to the local set. */
  portraits?: Record<string, ResolvedImage>;
}) {
  const selection = testimonials.slice(0, 3);
  if (selection.length === 0) return null;

  return (
    <Section id="testimonials" size="spacious" className="bg-sunken/50">
      <Container>
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          align="center"
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 text-center font-mono text-[0.625rem] tracking-[0.14em] uppercase lg:hidden">
            Swipe trader stories
          </p>

          <StaggerGroup
            role="list"
            className="mobile-snap-rail-lg gap-4 lg:grid lg:grid-cols-3 lg:gap-6"
          >
            {selection.map((testimonial) => {
              const portrait =
                portraits?.[testimonial.authorName] ??
                getTestimonialPortrait(testimonial.authorName);

              return (
                <StaggerItem
                  role="listitem"
                  key={testimonial.id}
                  className="mobile-snap-card w-[min(88vw,22rem)] lg:w-auto"
                >
                  <article className="border-line bg-panel flex h-full flex-col rounded-2xl border p-6 sm:p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/25 ring-offset-2 ring-offset-panel">
                      <Image
                        src={portrait.src}
                        alt={portrait.alt}
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                        {...("blurDataURL" in portrait && portrait.blurDataURL
                          ? {
                              placeholder: "blur" as const,
                              blurDataURL: portrait.blurDataURL,
                            }
                          : {})}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink truncate text-sm font-semibold">
                        {testimonial.authorName}
                      </p>
                      <p className="text-faint mt-0.5 truncate text-xs">
                        {[testimonial.authorTitle, testimonial.country]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div
                      className="text-amber flex shrink-0 gap-0.5"
                      aria-label={`${testimonial.rating} out of 5`}
                    >
                      {Array.from({ length: testimonial.rating }, (_, index) => (
                        <Star key={index} className="size-3 fill-current" />
                      ))}
                    </div>
                  </div>

                  <blockquote className="text-ink mt-6 flex-1 text-base leading-relaxed font-medium text-balance sm:text-[1.0625rem]">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {testimonial.payoutAmount !== null && (
                    <div className="border-line-soft mt-6 flex items-end justify-between gap-4 border-t pt-5">
                      <p className="text-faint font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
                        Latest payout
                      </p>
                      <div className="text-right">
                        <p className="text-mint tabular font-mono text-sm font-semibold">
                          {formatCurrency(testimonial.payoutAmount)}
                        </p>
                        {testimonial.accountSize !== null && (
                          <p className="text-faint mt-1 font-mono text-[0.6875rem]">
                            {formatCompactCurrency(testimonial.accountSize)} account
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
