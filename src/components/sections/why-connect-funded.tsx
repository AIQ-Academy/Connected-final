import {
  ArrowRight,
  Clock,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Monitor,
  Rocket,
  Scale,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getCompanyStats,
  getDifferentiators,
  type Differentiator,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n/locale";
import type { Heading } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * The five commitments that decide whether a trader trusts a prop firm. The
 * full nine-part argument stays on /about#why — this is the short version,
 * on a dark band so the page changes register at least once on the way down.
 */
const HEADLINE_REASONS = [
  "Rules enforced server-side",
  "Payouts in 24 to 48 hours",
  "No time limit on either phase",
  "One account, every asset class",
  "Scaling published up front",
] as const;

const iconMap: Record<Differentiator["icon"], LucideIcon> = {
  ShieldCheck,
  Zap,
  Clock,
  LayoutDashboard,
  Monitor,
  GraduationCap,
  Scale,
  Globe,
  Rocket,
};

const defaultHeading: Heading = {
  eyebrow: "Why trade with us",
  title: "A trading experience designed to be understood.",
  lead: "Clear conditions, connected tools, responsive support and a workflow that helps traders make decisions before they place an order.",
  actionHref: "/about#why",
  actionLabel: "The full argument",
};

export function WhySection({
  heading = defaultHeading,
  image,
  locale = "en",
}: {
  heading?: Heading;
  image?: ResolvedImage;
  locale?: Locale;
} = {}) {
  const panel = image ?? marketingImages.whyUs;
  // Select by position in the canonical English list (some HEADLINE_REASONS
  // titles predate the current differentiator copy and no longer match
  // verbatim — matching against English keeps that selection identical
  // regardless of which locale is being rendered).
  const englishDifferentiators = getDifferentiators("en");
  const localizedDifferentiators = getDifferentiators(locale);
  const reasons = HEADLINE_REASONS.flatMap((title) => {
    const index = englishDifferentiators.findIndex((item) => item.title === title);
    return index >= 0 ? [localizedDifferentiators[index]] : [];
  });

  return (
    <Section
      id="why-connect-funded"
      size="spacious"
      className="trading-horizon isolate overflow-hidden text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_15%_0%,rgb(var(--cf-brand-glow)/0.22),transparent_70%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          className="[&_.eyebrow]:text-white/70 [&_.chev]:bg-white/70 [&_.text-h2]:text-white [&_.text-lead]:text-white/70"
          action={
            <ButtonLink
              href={heading.actionHref}
              variant="outline"
              className="border-white/70 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              {heading.actionLabel}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-4 sm:mt-16 lg:mt-20 lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <Reveal className="h-full lg:col-span-5">
            <div className="relative h-full min-h-[22rem] overflow-hidden rounded-2xl border border-white/12 sm:min-h-[26rem]">
              <div className="relative h-full min-h-[inherit]">
                <Image
                  src={panel.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover object-center"
                  {...("blurDataURL" in panel && panel.blurDataURL
                    ? {
                        placeholder: "blur" as const,
                        blurDataURL: panel.blurDataURL,
                      }
                    : {})}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.88)_0%,rgb(var(--cf-hero-rgb)/0.2)_45%,transparent_100%)]"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="font-mono text-[0.625rem] tracking-[0.18em] text-white/65 uppercase">
                    {locale === "ar" ? "مصمم للمتداولين النشطين" : locale === "fr" ? "Conçu pour les traders actifs" : "Built for active traders"}
                  </p>
                  <p className="font-display mt-2 text-2xl leading-snug font-semibold text-white">
                    {locale === "ar" ? "بنية تحتية وشروط يمكنك التحقق منها قبل الإيداع." : locale === "fr" ? "Une infrastructure et des conditions vérifiables avant le dépôt." : "Infrastructure and conditions you can verify before you deposit."}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative lg:col-span-7">
            <p className="mb-3 font-mono text-[0.625rem] tracking-[0.14em] text-white/45 uppercase sm:hidden">
              {locale === "ar" ? "استعرض التزاماتنا" : locale === "fr" ? "Nos engagements" : "Swipe commitments"}
            </p>
            <StaggerGroup
              role="list"
              className="mobile-snap-rail gap-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:content-start lg:grid-cols-2"
            >
            {reasons.slice(0, 4).map((reason, index) => {
              const Icon = iconMap[reason.icon] ?? ShieldCheck;
              const featured = index === reasons.length - 1;

              return (
                <StaggerItem
                  role="listitem"
                  key={reason.title}
                  className={cn(
                    "mobile-snap-card w-[min(88vw,22rem)] sm:w-auto",
                    featured && "sm:col-span-2 lg:col-span-2",
                  )}
                >
                  <article className="group relative h-full overflow-hidden rounded-2xl border border-white/14 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-white/28 hover:bg-white/[0.07] sm:p-7">
                    <span
                      aria-hidden="true"
                      className="absolute -top-12 -right-12 size-28 rounded-full bg-[rgb(var(--cf-brand-glow)/0.16)] blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"
                    />
                    <div className="relative flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/18 bg-white/[0.06] text-white">
                        <Icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[0.625rem] tracking-[0.16em] text-white/45 uppercase">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display mt-1.5 text-lg leading-snug font-semibold text-white">
                          {reason.title}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-white/65">
                          {reason.body}
                        </p>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
            </StaggerGroup>
          </div>
        </div>

        <Reveal delay={0.1}>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 lg:mt-6 lg:grid-cols-4">
            {getCompanyStats(locale).map((stat) => (
              <div
                key={stat.label}
                  className="bg-[var(--cf-terminal-bg)] px-5 py-7 sm:px-7 sm:py-8"
              >
                <dt className="font-mono text-[0.625rem] tracking-[0.14em] text-white/50 uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display tabular mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
